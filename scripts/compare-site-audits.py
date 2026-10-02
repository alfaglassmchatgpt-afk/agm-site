"""Compare private v2 auditor JSON exports; write results outside public Git."""
import argparse
import json
from pathlib import Path

FIELDS = ("title", "status", "template", "menu_order", "content_sha256", "excerpt_sha256", "elementor_sha256", "seo_meta", "material_group", "navigation_section")

def compare(before, after):
    for report in (before, after):
        if report.get("schema_version") != 2 or not report["content"]["complete"]:
            raise ValueError("Need complete schema v2 exports from both sites")
    def index(report):
        rows = {}
        for item in report["content"]["items"]:
            key = (item["type"], item["path"] if item["type"] == "page" else item["slug"])
            if not key[1]:
                continue
            if key in rows:
                raise ValueError("Ambiguous content paths")
            rows[key] = item
        return rows
    left, right = index(before), index(after)
    changed = []
    for key in sorted(left.keys() & right.keys()):
        fields = [f for f in FIELDS if left[key].get(f) != right[key].get(f)]
        if fields:
            changed.append({"type": key[0], "path": key[1], "fields": fields})
    a, b = before["seo"]["important_options_sha256"], after["seo"]["important_options_sha256"]
    return {"unmatched_without_slug": {"before": len(before["content"]["items"])-len(left), "after": len(after["content"]["items"])-len(right)},
            "added": [list(k) for k in sorted(right.keys()-left.keys())],
            "removed": [list(k) for k in sorted(left.keys()-right.keys())],
            "changed": changed,
            "seo_options_changed": [k for k in sorted(a.keys() | b.keys()) if a.get(k) != b.get(k)],
            "redirects_changed": before["redirects"].get("sha256") != after["redirects"].get("sha256"),
            "themes_changed": [k for k in sorted(before["theme_files"].keys() | after["theme_files"].keys()) if before["theme_files"].get(k) != after["theme_files"].get(k)],
            "note": "Differences flag review only. Status differences are expected for production drafts; WordPress IDs and theme file scope differ. No automatic changes."}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = compare(json.loads(args.before.read_text(encoding="utf-8")), json.loads(args.after.read_text(encoding="utf-8")))
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Added:",len(result["added"]),"Removed:",len(result["removed"]),"Changed:",len(result["changed"]))
