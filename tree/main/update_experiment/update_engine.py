#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import time
import logging
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional, Set, Tuple

logger = logging.getLogger(__name__)

BACKEND_URL = "http://localhost:5000"
POLL_INTERVAL = 2
MAX_WAIT_TIME = 300


class UpdateEngine:
    def __init__(self, schema_path: str, backend_url: str = BACKEND_URL):
        self.schema = json.loads(Path(schema_path).read_text(encoding="utf-8"))
        self.backend_url = backend_url
        self._converted_schema = self._convert_schema(self.schema)

    def _convert_schema(self, schema: Dict) -> Dict:
        converted = json.loads(json.dumps(schema))
        for table in converted.get("tables", []):
            if "fields" in table:
                table["attributes"] = table.pop("fields")
        return converted

    def _primary_keys(self) -> Dict[str, List[str]]:
        pks: Dict[str, List[str]] = {}
        for table in self.schema.get("tables", []):
            name = table["name"]
            keys = [
                f["name"]
                for f in table.get("fields", [])
                if f.get("constraints", {}).get("primary_key")
                or f.get("constraints", {}).get("foreign_key")
            ]
            if not keys:
                keys = [f["name"] for f in table.get("fields", [])]
            pks[name] = keys
        return pks

    def extract_db(self, doc_path: str, model: str = "gpt-4o") -> Optional[Dict[str, List]]:
        doc_path = str(Path(doc_path).resolve())
        request_data = {
            "files": [doc_path],
            "schema": json.dumps(self._converted_schema),
            "table_name": "",
            "input_mode": "schema",
            "schema_mode": "json",
            "model": model,
            "nl_prompt": "",
            "processing_mode": "serial",
            "max_concurrent_tables": 3,
            "document_mode": "single",
        }

        try:
            resp = requests.post(
                f"{self.backend_url}/api/doc2db/process",
                json=request_data,
                timeout=30,
            )
        except requests.RequestException as e:
            logger.error(f"Failed to POST to backend: {e}")
            return None

        if resp.status_code != 200:
            logger.error(f"Backend returned {resp.status_code}: {resp.text}")
            return None

        task_id = resp.json().get("task_id")
        if not task_id:
            logger.error("No task_id in backend response")
            return None

        logger.info(f"  Task started: {task_id}")
        return self._poll_result(task_id)

    def _poll_result(self, task_id: str) -> Optional[Dict[str, List]]:
        start = time.time()
        while True:
            elapsed = time.time() - start
            if elapsed > MAX_WAIT_TIME:
                logger.error(f"Task {task_id} timed out after {MAX_WAIT_TIME}s")
                return None

            try:
                resp = requests.get(
                    f"{self.backend_url}/api/doc2db/status/{task_id}",
                    timeout=10,
                )
            except requests.RequestException as e:
                logger.warning(f"Poll error: {e}")
                time.sleep(POLL_INTERVAL)
                continue

            if resp.status_code != 200:
                logger.warning(f"Status poll returned {resp.status_code}")
                time.sleep(POLL_INTERVAL)
                continue

            data = resp.json()
            status = data.get("status", "unknown")
            step = data.get("current_step", "")
            if step:
                logger.info(f"  [{int(elapsed)}s] {step}")

            if status == "completed":
                logger.info(f"  Task completed in {int(elapsed)}s")
                return self._fetch_tables(task_id)

            if status == "failed":
                logger.error(f"  Task failed: {data.get('error', 'unknown error')}")
                return self._fetch_tables(task_id)

            time.sleep(POLL_INTERVAL)

    def _fetch_tables(self, task_id: str) -> Optional[Dict[str, List]]:
        result_file = (
            Path(__file__).parent.parent / "backend" / "output" / task_id / "result.json"
        )
        if not result_file.exists():
            logger.error(f"result.json not found at {result_file}")
            return None
        with open(result_file, encoding="utf-8") as f:
            data = json.load(f)
        tables = data.get("tables", {})
        
        deduped_tables = {}
        for table_name, rows in tables.items():
            if not rows:
                deduped_tables[table_name] = rows
                continue
            
            original_count = len(rows)
            deduped_rows = self._merge_rows(rows)
            deduped_count = len(deduped_rows)
            
            if original_count != deduped_count:
                logger.info(f"  Deduped {table_name}: {original_count} → {deduped_count} rows")
            deduped_tables[table_name] = deduped_rows
        
        logger.info(f"  Loaded {len(deduped_tables)} tables from result.json")
        return deduped_tables
    
    def _merge_rows(self, rows: List[Dict]) -> List[Dict]:
        if not rows:
            return rows
        
        filtered_rows = []
        single_field_removed = 0
        
        for row in rows:
            non_empty_count = self._count_non_empty_fields(row)
            if non_empty_count <= 1:
                single_field_removed += 1
            else:
                filtered_rows.append(row)
        
        if single_field_removed > 0:
            logger.debug(f"  Removed {single_field_removed} rows with single field (noise)")
        
        unique_rows = []
        removed_count = 0
        
        for i, row1 in enumerate(filtered_rows):
            should_keep = True
            
            for j, row2 in enumerate(filtered_rows):
                if i == j:
                    continue
                
                relation = self._compare_rows(row1, row2)
                
                if relation == 'identical':
                    if j < i:
                        should_keep = False
                        removed_count += 1
                        break
                elif relation == 'row1_subset':
                    should_keep = False
                    removed_count += 1
                    break
            
            if should_keep:
                unique_rows.append(row1)
        
        if removed_count > 0:
            logger.debug(f"  Removed {removed_count} duplicate/subset rows")
        
        return unique_rows
    
    def _count_non_empty_fields(self, row: Dict) -> int:
        count = 0
        for value in row.values():
            if value not in [None, '', 'null', 'NULL']:
                count += 1
        return count
    
    def _compare_rows(self, row1: Dict, row2: Dict) -> str:
        values1_normalized = {}
        values2_normalized = {}
        
        for field, value in row1.items():
            if value not in [None, '', 'null', 'NULL']:
                raw_value = str(value).strip()
                values1_normalized[field] = self._normalize_value(raw_value)
        
        for field, value in row2.items():
            if value not in [None, '', 'null', 'NULL']:
                raw_value = str(value).strip()
                values2_normalized[field] = self._normalize_value(raw_value)
        
        if values1_normalized == values2_normalized:
            return 'identical'
        
        if values1_normalized and values2_normalized:
            if all(field in values2_normalized and values1_normalized[field] == values2_normalized[field]
                   for field in values1_normalized):
                if len(values1_normalized) < len(values2_normalized):
                    return 'row1_subset'
                elif len(values1_normalized) == len(values2_normalized):
                    return 'identical'
            
            if all(field in values1_normalized and values2_normalized[field] == values1_normalized[field]
                   for field in values2_normalized):
                if len(values2_normalized) < len(values1_normalized):
                    return 'row2_subset'
        
        return 'different'
    
    def _normalize_value(self, value: str) -> str:
        return value.lower().strip()

    def _row_key(self, table: str, row: Dict, pk_map: Dict[str, List[str]]) -> Tuple:
        keys = pk_map.get(table, list(row.keys()))
        return tuple(str(row.get(k, "")) for k in keys)

    def diff_db(
        self, base: Dict[str, List], updated: Dict[str, List]
    ) -> Dict[str, Any]:
        pk_map = self._primary_keys()
        all_tables: Set[str] = set(base) | set(updated)

        inserted: List[Dict] = []
        deleted: List[Dict] = []
        updated_rows: List[Dict] = []

        for table in all_tables:
            base_rows = base.get(table, [])
            new_rows = updated.get(table, [])

            base_index: Dict[Tuple, Dict] = {
                self._row_key(table, r, pk_map): r for r in base_rows
            }
            new_index: Dict[Tuple, Dict] = {
                self._row_key(table, r, pk_map): r for r in new_rows
            }

            base_keys = set(base_index)
            new_keys = set(new_index)

            for k in new_keys - base_keys:
                inserted.append({"table": table, "tuple": new_index[k]})

            for k in base_keys - new_keys:
                deleted.append({"table": table, "tuple": base_index[k]})

            for k in base_keys & new_keys:
                old = base_index[k]
                new = new_index[k]
                changed = False
                for field in set(old) | set(new):
                    old_val = old.get(field)
                    new_val = new.get(field)
                    if old_val is None and new_val is None:
                        continue
                    if str(old_val) != str(new_val):
                        changed = True
                        break
                if changed:
                    updated_rows.append({"table": table, "tuple": new})

        noop = not inserted and not deleted and not updated_rows
        return {
            "inserted": inserted,
            "deleted": deleted,
            "updated": updated_rows,
            "noop": noop,
        }

    def classify_action(self, delta: Dict) -> str:
        if delta["noop"]:
            return "No-Op"
        actions: List[str] = []
        if delta["inserted"]:
            actions.append("Insert")
        if delta["deleted"]:
            actions.append("Delete")
        if delta["updated"]:
            actions.append("Update")
        return "+".join(sorted(actions)) if actions else "No-Op"
