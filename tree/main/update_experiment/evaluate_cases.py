#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import logging
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

EXPERIMENT_DIR = Path(__file__).parent
RESULTS_DIR_DEFAULT = EXPERIMENT_DIR / "results"


def _row_to_cells(table: str, row: Dict) -> List[Tuple[str, str, Any]]:
    return [
        (table, field, str(value).strip() if value is not None else "")
        for field, value in row.items()
        if value is not None and str(value).strip() != ""
    ]


def compute_cell_prf(
    expected_db: Optional[Dict[str, List]],
    actual_db: Optional[Dict[str, List]],
) -> Dict[str, Dict[str, float]]:
    if not expected_db or not actual_db:
        return {}

    from collections import Counter

    all_tables = set(expected_db) | set(actual_db)
    results: Dict[str, Dict[str, float]] = {}

    for table in all_tables:
        exp_rows = expected_db.get(table, [])
        act_rows = actual_db.get(table, [])

        exp_cells_list = []
        for row in exp_rows:
            for cell in _row_to_cells(table, row):
                exp_cells_list.append(cell)

        act_cells_list = []
        for row in act_rows:
            for cell in _row_to_cells(table, row):
                act_cells_list.append(cell)

        exp_cells_counter = Counter(exp_cells_list)
        act_cells_counter = Counter(act_cells_list)

        tp = 0
        fp = 0
        fn = 0

        all_cells = set(exp_cells_counter.keys()) | set(act_cells_counter.keys())

        for cell in all_cells:
            exp_count = exp_cells_counter.get(cell, 0)
            act_count = act_cells_counter.get(cell, 0)
            
            tp += min(exp_count, act_count)
            if act_count > exp_count:
                fp += act_count - exp_count
            if exp_count > act_count:
                fn += exp_count - act_count

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (
            2 * precision * recall / (precision + recall)
            if (precision + recall) > 0
            else 0.0
        )
        results[table] = {"precision": precision, "recall": recall, "f1": f1}

    return results


def load_results(results_dir: Path) -> List[Dict]:
    result_files = sorted(results_dir.glob("C*.json"))
    if not result_files:
        logger.error(f"No result files found in {results_dir}")
        return []
    results = []
    for fp in result_files:
        with open(fp, encoding="utf-8") as f:
            results.append(json.load(f))
    return results


def generate_report(results: List[Dict]) -> Dict:
    total = len(results)
    passed = sum(1 for r in results if r.get("pass"))
    errors = sum(1 for r in results if r.get("actual_action") == "ERROR")

    action_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: {"pass": 0, "fail": 0})
    for r in results:
        expected_action = r.get("expected_action", "unknown")
        if r.get("pass"):
            action_stats[expected_action]["pass"] += 1
        else:
            action_stats[expected_action]["fail"] += 1

    op_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: {"pass": 0, "fail": 0})
    for r in results:
        op = r.get("snippet_op", "unknown")
        if r.get("pass"):
            op_stats[op]["pass"] += 1
        else:
            op_stats[op]["fail"] += 1

    table_cell_stats: Dict[str, List[Dict[str, float]]] = defaultdict(list)
    total_tp = 0
    total_fp = 0
    total_fn = 0
    
    for r in results:
        expected_db = r.get("expected_db")
        actual_db = r.get("actual_db")
        if expected_db and actual_db:
            per_table = compute_cell_prf(expected_db, actual_db)
            for table, metrics in per_table.items():
                table_cell_stats[table].append(metrics)
            
            from collections import Counter
            for table in set(expected_db) | set(actual_db):
                exp_rows = expected_db.get(table, [])
                act_rows = actual_db.get(table, [])
                
                exp_cells_list = []
                for row in exp_rows:
                    for cell in _row_to_cells(table, row):
                        exp_cells_list.append(cell)
                
                act_cells_list = []
                for row in act_rows:
                    for cell in _row_to_cells(table, row):
                        act_cells_list.append(cell)
                
                exp_cells_counter = Counter(exp_cells_list)
                act_cells_counter = Counter(act_cells_list)
                
                all_cells = set(exp_cells_counter.keys()) | set(act_cells_counter.keys())
                for cell in all_cells:
                    exp_count = exp_cells_counter.get(cell, 0)
                    act_count = act_cells_counter.get(cell, 0)
                    total_tp += min(exp_count, act_count)
                    if act_count > exp_count:
                        total_fp += act_count - exp_count
                    if exp_count > act_count:
                        total_fn += exp_count - act_count

    avg_cell_prf: Dict[str, Dict[str, float]] = {}
    for table, metric_list in table_cell_stats.items():
        avg_cell_prf[table] = {
            "precision": sum(m["precision"] for m in metric_list) / len(metric_list),
            "recall": sum(m["recall"] for m in metric_list) / len(metric_list),
            "f1": sum(m["f1"] for m in metric_list) / len(metric_list),
            "cases_evaluated": len(metric_list),
        }
    
    overall_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    overall_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    overall_f1 = (
        2 * overall_precision * overall_recall / (overall_precision + overall_recall)
        if (overall_precision + overall_recall) > 0
        else 0.0
    )

    summary = {
        "total_cases": total,
        "passed": passed,
        "failed": total - passed - errors,
        "errors": errors,
        "case_accuracy": passed / total if total > 0 else 0.0,
        "overall_precision": overall_precision,
        "overall_recall": overall_recall,
        "overall_f1": overall_f1,
        "per_expected_action": dict(action_stats),
        "per_snippet_op": dict(op_stats),
        "cell_level_prf_by_table": avg_cell_prf,
        "per_case": [
            {
                "case_id": r.get("case_id"),
                "snippet_op": r.get("snippet_op"),
                "expected_action": r.get("expected_action"),
                "actual_action": r.get("actual_action"),
                "pass": r.get("pass"),
                "error": r.get("error"),
            }
            for r in results
        ],
    }
    return summary


def print_report(summary: Dict) -> None:
    print("\n" + "=" * 70)
    print("  Doc2DB Document-Update Experiment — Evaluation Report")
    print("=" * 70)

    acc = summary["case_accuracy"] * 100
    print(f"\nOverall Case Accuracy: {summary['passed']}/{summary['total_cases']}  ({acc:.1f}%)")
    if summary["errors"]:
        print(f"  Errors (extraction failed): {summary['errors']}")

    print("\n--- Per-Case Results ---")
    header = f"{'Case':<6}  {'Snippet Op':<12}  {'Expected':<18}  {'Actual':<18}  {'Pass'}"
    print(header)
    print("-" * len(header))
    for c in summary["per_case"]:
        status = "✓" if c["pass"] else ("ERR" if c.get("error") else "✗")
        print(
            f"{c['case_id']:<6}  {c['snippet_op']:<12}  "
            f"{c['expected_action']:<18}  {c['actual_action']:<18}  {status}"
        )

    print("\n--- Per-Expected-Action Breakdown ---")
    print(f"{'Action':<20}  {'Pass':>6}  {'Fail':>6}  {'Accuracy':>10}")
    print("-" * 48)
    for action, counts in sorted(summary["per_expected_action"].items()):
        total_action = counts["pass"] + counts["fail"]
        action_acc = counts["pass"] / total_action if total_action else 0
        print(
            f"{action:<20}  {counts['pass']:>6}  {counts['fail']:>6}  "
            f"{action_acc*100:>9.1f}%"
        )

    print("\n--- Per-Snippet-Op Breakdown ---")
    print(f"{'Snippet Op':<14}  {'Pass':>6}  {'Fail':>6}  {'Accuracy':>10}")
    print("-" * 42)
    for op, counts in sorted(summary["per_snippet_op"].items()):
        total_op = counts["pass"] + counts["fail"]
        op_acc = counts["pass"] / total_op if total_op else 0
        print(
            f"{op:<14}  {counts['pass']:>6}  {counts['fail']:>6}  "
            f"{op_acc*100:>9.1f}%"
        )

    if summary["cell_level_prf_by_table"]:
        print("\n--- Cell-Level P/R/F1 by Table (averaged across cases) ---")
        print(f"{'Table':<18}  {'Precision':>10}  {'Recall':>8}  {'F1':>8}  {'Cases':>6}")
        print("-" * 58)
        for table, m in sorted(summary["cell_level_prf_by_table"].items()):
            print(
                f"{table:<18}  {m['precision']:>9.3f}  {m['recall']:>8.3f}  "
                f"{m['f1']:>7.3f}  {m['cases_evaluated']:>6}"
            )
        
        print("\n--- Overall Cell-Level P/R/F1 (micro-average across all tables) ---")
        print(f"Precision: {summary['overall_precision']:.3f}")
        print(f"Recall:    {summary['overall_recall']:.3f}")
        print(f"F1:        {summary['overall_f1']:.3f}")

    print("\n" + "=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate results from the Doc2DB update experiment"
    )
    parser.add_argument(
        "--results-dir",
        default=str(RESULTS_DIR_DEFAULT),
        help="Directory containing C*.json result files",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Save summary JSON to this path (default: results/summary.json)",
    )
    args = parser.parse_args()

    results_dir = Path(args.results_dir)
    results = load_results(results_dir)
    if not results:
        return

    summary = generate_report(results)
    print_report(summary)

    output_path = Path(args.output) if args.output else results_dir / "summary.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    logger.info(f"Summary saved to {output_path}")


if __name__ == "__main__":
    main()
