#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import logging
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from update_engine import UpdateEngine

try:
    from dotenv import load_dotenv
    env_file = Path(__file__).parent.parent / "llm" / ".env"
    if env_file.exists():
        load_dotenv(env_file)
        for url_var in ["API_URL", "API_URL1", "API_URL2", "DEEPSEEK_URL", "QWEN_URL"]:
            url_value = os.getenv(url_var)
            if url_value and url_value.endswith("/chat/completions"):
                os.environ[url_var] = url_value.replace("/chat/completions", "")
except ImportError:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

EXPERIMENT_DIR = Path(__file__).parent
DATASET_DIR = EXPERIMENT_DIR / "dataset"
CASES_DIR = DATASET_DIR / "cases"
RESULTS_DIR = EXPERIMENT_DIR / "results"
SCHEMA_PATH = DATASET_DIR / "schema.json"
BASE_DB_PATH = DATASET_DIR / "base_db.json"


def load_base_db() -> dict:
    with open(BASE_DB_PATH, encoding="utf-8") as f:
        return json.load(f)


def discover_cases(filter_ids: list[str] | None = None) -> list[Path]:
    all_cases = sorted(CASES_DIR.iterdir())
    if filter_ids:
        filter_prefixes = {cid.upper() for cid in filter_ids}
        all_cases = [
            c for c in all_cases
            if any(c.name.upper().startswith(p) for p in filter_prefixes)
        ]
    return [c for c in all_cases if c.is_dir()]


def run_case(case_dir: Path, engine: UpdateEngine, base_db: dict, model: str) -> dict:
    case_id = case_dir.name.split("_")[0]

    expected_path = case_dir / "expected.json"
    modified_doc_path = case_dir / "modified_doc.txt"

    if not expected_path.exists():
        raise FileNotFoundError(f"Missing expected.json in {case_dir}")
    if not modified_doc_path.exists():
        raise FileNotFoundError(f"Missing modified_doc.txt in {case_dir}")

    with open(expected_path, encoding="utf-8") as f:
        expected = json.load(f)

    logger.info(f"\n{'='*60}")
    logger.info(f"Running {case_id}: {expected.get('description', '')}")
    logger.info(f"  snippet_op={expected['snippet_op']}  "
                f"expected_action={expected['expected_tuple_action']}")
    logger.info(f"  document: {modified_doc_path}")

    actual_db = engine.extract_db(str(modified_doc_path), model=model)

    if actual_db is None:
        logger.error(f"  Extraction FAILED for {case_id}")
        result = {
            "case_id": case_id,
            "case_dir": case_dir.name,
            "snippet_op": expected["snippet_op"],
            "expected_action": expected["expected_tuple_action"],
            "actual_action": "ERROR",
            "actual_db": None,
            "expected_db": expected["expected_db"],
            "pass": False,
            "error": "extraction failed",
            "delta_detail": None,
        }
        return result

    delta = engine.diff_db(base_db, actual_db)
    actual_action = engine.classify_action(delta)

    passed = actual_action == expected["expected_tuple_action"]
    status_str = "PASS" if passed else "FAIL"
    logger.info(
        f"  {status_str}: expected={expected['expected_tuple_action']}  "
        f"actual={actual_action}"
    )
    if not passed:
        if delta["inserted"]:
            logger.info(f"    inserted: {delta['inserted']}")
        if delta["deleted"]:
            logger.info(f"    deleted:  {delta['deleted']}")
        if delta["updated"]:
            logger.info(f"    updated:  {delta['updated']}")

    return {
        "case_id": case_id,
        "case_dir": case_dir.name,
        "snippet_op": expected["snippet_op"],
        "expected_action": expected["expected_tuple_action"],
        "actual_action": actual_action,
        "actual_db": actual_db,
        "expected_db": expected["expected_db"],
        "pass": passed,
        "error": None,
        "delta_detail": delta,
    }


def main():
    parser = argparse.ArgumentParser(description="Doc2DB document-update experiment runner")
    parser.add_argument("--model", default="gpt-4o", help="LLM model name")
    parser.add_argument("--backend", default="http://localhost:5000", help="Backend URL")
    parser.add_argument(
        "--cases", nargs="*", metavar="CXX",
        help="Specific case IDs to run (e.g. C01 C03); default: all"
    )
    args = parser.parse_args()

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    engine = UpdateEngine(str(SCHEMA_PATH), backend_url=args.backend)
    base_db = load_base_db()
    case_dirs = discover_cases(args.cases)

    if not case_dirs:
        logger.error("No cases found. Check dataset/cases/ directory.")
        sys.exit(1)

    logger.info(f"Running {len(case_dirs)} cases with model={args.model}")

    summary = {"total": 0, "passed": 0, "failed": 0, "errors": 0}

    for case_dir in case_dirs:
        try:
            result = run_case(case_dir, engine, base_db, args.model)
        except Exception as e:
            case_id = case_dir.name.split("_")[0]
            logger.exception(f"Unexpected error in {case_id}: {e}")
            result = {
                "case_id": case_id,
                "case_dir": case_dir.name,
                "snippet_op": "unknown",
                "expected_action": "unknown",
                "actual_action": "ERROR",
                "actual_db": None,
                "expected_db": None,
                "pass": False,
                "error": str(e),
                "delta_detail": None,
            }

        out_file = RESULTS_DIR / f"{result['case_id']}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        summary["total"] += 1
        if result.get("error") and result["actual_action"] == "ERROR":
            summary["errors"] += 1
        elif result["pass"]:
            summary["passed"] += 1
        else:
            summary["failed"] += 1

    logger.info(f"\n{'='*60}")
    logger.info(f"SUMMARY: {summary['passed']}/{summary['total']} passed  "
                f"({summary['failed']} failed, {summary['errors']} errors)")
    logger.info(f"Results saved to: {RESULTS_DIR}")


if __name__ == "__main__":
    main()
