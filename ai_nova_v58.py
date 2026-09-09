from pathlib import Path
import json
import re
from datetime import datetime

ROOT = Path.home() / "ai-nova"
DATA = ROOT / "data"
ASSETS = ROOT / "assets"

TOOLS_FILE = DATA / "tools.json"
REGISTRY_FILE = DATA / "tool-registry.json"
REPORT_FILE = DATA / "v58-audit-report.json"
REPORT_TXT = ROOT / "AI_NOVA_V58_AUDIT.txt"

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def catalog_list(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        if isinstance(data.get("tools"), list):
            return data["tools"]
        return list(data.values())
    return []

# ------------------------------------------------------------
# 1. Catalog
# ------------------------------------------------------------
catalog_raw = load_json(TOOLS_FILE)
catalog = catalog_list(catalog_raw)

tool_ids = []
tool_objects = {}

for item in catalog:
    if not isinstance(item, dict):
        continue
    tid = str(item.get("id", "")).strip()
    if tid:
        tool_ids.append(tid)
        tool_objects[tid] = item

catalog_count = len(tool_ids)
unique_count = len(set(tool_ids))

# ------------------------------------------------------------
# 2. Registry
# ------------------------------------------------------------
registry_raw = load_json(REGISTRY_FILE)

if isinstance(registry_raw, dict) and isinstance(registry_raw.get("tools"), dict):
    registry = registry_raw["tools"]
elif isinstance(registry_raw, dict):
    registry = registry_raw
elif isinstance(registry_raw, list):
    registry = {}
    for item in registry_raw:
        if isinstance(item, dict):
            tid = str(item.get("id", "")).strip()
            if tid:
                registry[tid] = item
else:
    registry = {}

registry_ids = set(registry.keys())
catalog_ids = set(tool_ids)

missing_registry = sorted(catalog_ids - registry_ids)
orphan_registry = sorted(registry_ids - catalog_ids)

available = sorted(
    tid for tid in catalog_ids
    if isinstance(registry.get(tid), dict)
    and registry[tid].get("status") == "Available"
    and registry[tid].get("implemented") is True
)

coming = sorted(catalog_ids - set(available))

# ------------------------------------------------------------
# 3. JavaScript engines
# ------------------------------------------------------------
engine_names = [
    "nova-engine-v52.js",
    "nova-engine-v55.js",
    "nova-engine-v56.js",
    "nova-smart-ui.js",
    "nova-file-engine-v54.js",
    "nova-router-v57.js",
    "nova-registry-v57.js",
]

engines = {}
all_engine_text = ""

for name in engine_names:
    p = ASSETS / name
    exists = p.exists()
    text = p.read_text(encoding="utf-8") if exists else ""
    engines[name] = {
        "exists": exists,
        "bytes": len(text.encode("utf-8")),
        "lines": text.count("\n") + 1 if text else 0
    }
    all_engine_text += "\n" + text

# ------------------------------------------------------------
# 4. Detect direct implementation references
# ------------------------------------------------------------
engine_references = set()

for tid in catalog_ids:
    pattern = r"""['"]""" + re.escape(tid) + r"""['"]"""
    if re.search(pattern, all_engine_text):
        engine_references.add(tid)

# ------------------------------------------------------------
# 5. Tool page checks
# ------------------------------------------------------------
tool_page = ROOT / "tool.html"
tool_html = tool_page.read_text(encoding="utf-8") if tool_page.exists() else ""

loaded_assets = sorted(
    set(re.findall(
        r'<script[^>]+src=["\']([^"\']+)["\']',
        tool_html,
        flags=re.I
    ))
)

missing_assets = []

for src in loaded_assets:
    if src.startswith("http://") or src.startswith("https://"):
        continue

    clean = src.split("?", 1)[0].split("#", 1)[0]
    target = ROOT / clean

    if not target.exists():
        missing_assets.append(clean)

router_wired = "AINovaUnified.run" in tool_html
v56_loaded = "assets/nova-engine-v56.js" in tool_html
v55_loaded = "assets/nova-engine-v55.js" in tool_html
v54_loaded = "assets/nova-file-engine-v54.js" in tool_html
registry_loader_loaded = "assets/nova-registry-v57.js" in tool_html
router_loaded = "assets/nova-router-v57.js" in tool_html

# ------------------------------------------------------------
# 6. Registry / engine consistency
# ------------------------------------------------------------
available_without_engine_reference = sorted(
    tid for tid in available
    if tid not in engine_references
)

engine_reference_not_available = sorted(
    tid for tid in engine_references
    if tid in catalog_ids and tid not in available
)

# ------------------------------------------------------------
# 7. Basic ID quality
# ------------------------------------------------------------
invalid_ids = sorted(
    tid for tid in catalog_ids
    if not re.match(r"^[A-Za-z0-9][A-Za-z0-9_-]*$", tid)
)

empty_names = sorted(
    tid for tid, obj in tool_objects.items()
    if not str(obj.get("name", obj.get("title", ""))).strip()
)

# ------------------------------------------------------------
# 8. Overall health
# ------------------------------------------------------------
checks = {
    "catalog_has_179_tools": catalog_count == 179,
    "catalog_ids_unique": unique_count == 179,
    "registry_has_all_catalog_tools": len(missing_registry) == 0,
    "no_orphan_registry_tools": len(orphan_registry) == 0,
    "tool_page_exists": tool_page.exists(),
    "v56_loaded": v56_loaded,
    "v55_loaded": v55_loaded,
    "v54_file_engine_loaded": v54_loaded,
    "registry_loader_loaded": registry_loader_loaded,
    "router_loaded": router_loaded,
    "unified_router_wired": router_wired,
    "no_missing_local_assets": len(missing_assets) == 0,
    "no_available_without_engine_reference": len(available_without_engine_reference) == 0,
    "no_invalid_ids": len(invalid_ids) == 0,
    "no_empty_names": len(empty_names) == 0,
}

passed = sum(1 for x in checks.values() if x)
total_checks = len(checks)

# ------------------------------------------------------------
# 9. Report
# ------------------------------------------------------------
report = {
    "version": "5.8",
    "generated": datetime.now().isoformat(),
    "catalog": {
        "total": catalog_count,
        "unique_ids": unique_count,
        "invalid_ids": invalid_ids,
        "empty_names": empty_names,
    },
    "registry": {
        "total": len(registry_ids),
        "missing_registry": missing_registry,
        "orphan_registry": orphan_registry,
        "available": available,
        "available_count": len(available),
        "coming_soon": coming,
        "coming_soon_count": len(coming),
    },
    "engines": engines,
    "engine_references": sorted(engine_references),
    "consistency": {
        "available_without_engine_reference": available_without_engine_reference,
        "engine_reference_not_available": engine_reference_not_available,
    },
    "tool_page": {
        "exists": tool_page.exists(),
        "loaded_assets": loaded_assets,
        "missing_assets": missing_assets,
        "v56_loaded": v56_loaded,
        "v55_loaded": v55_loaded,
        "v54_loaded": v54_loaded,
        "registry_loader_loaded": registry_loader_loaded,
        "router_loaded": router_loaded,
        "unified_router_wired": router_wired,
    },
    "checks": checks,
    "health": {
        "passed": passed,
        "total": total_checks,
        "score_percent": round((passed / total_checks) * 100, 1)
    }
}

with open(REPORT_FILE, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

# Human-readable report
lines = []
lines.append("=" * 64)
lines.append("                 AI NOVA V5.8 AUDIT")
lines.append("=" * 64)
lines.append(f"CATALOG TOOLS          : {catalog_count}")
lines.append(f"UNIQUE IDS             : {unique_count}")
lines.append(f"AVAILABLE              : {len(available)}")
lines.append(f"COMING SOON            : {len(coming)}")
lines.append(f"REGISTRY TOTAL         : {len(registry_ids)}")
lines.append("-" * 64)
lines.append(f"AUDIT SCORE            : {passed}/{total_checks} ({report['health']['score_percent']}%)")
lines.append("-" * 64)

for name, ok in checks.items():
    lines.append(("PASS " if ok else "FAIL ") + name)

lines.append("-" * 64)

if missing_registry:
    lines.append("MISSING REGISTRY:")
    lines.extend("  - " + x for x in missing_registry)

if orphan_registry:
    lines.append("ORPHAN REGISTRY:")
    lines.extend("  - " + x for x in orphan_registry)

if available_without_engine_reference:
    lines.append("AVAILABLE WITHOUT ENGINE REFERENCE:")
    lines.extend("  - " + x for x in available_without_engine_reference)

if engine_reference_not_available:
    lines.append("ENGINE REFERENCES NOT MARKED AVAILABLE:")
    lines.extend("  - " + x for x in engine_reference_not_available)

if missing_assets:
    lines.append("MISSING LOCAL ASSETS:")
    lines.extend("  - " + x for x in missing_assets)

lines.append("=" * 64)

REPORT_TXT.write_text("\n".join(lines), encoding="utf-8")

print("\n".join(lines))
print()
print("JSON REPORT :", REPORT_FILE)
print("TEXT REPORT :", REPORT_TXT)
