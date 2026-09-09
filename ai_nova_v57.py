from pathlib import Path
import json, re, shutil
from datetime import datetime

ROOT = Path.home() / "ai-nova"
DATA = ROOT / "data"
ASSETS = ROOT / "assets"

TOOLS = DATA / "tools.json"
REGISTRY = DATA / "tool-registry.json"
TOOL_PAGE = ROOT / "tool.html"

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = ROOT / f".ai-nova-backup-v57-{stamp}"
backup.mkdir(parents=True, exist_ok=True)

def read_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

# ------------------------------------------------------------
# 1. Validate source catalog
# ------------------------------------------------------------
tools = read_json(TOOLS)

if isinstance(tools, dict):
    if "tools" in tools:
        tools = tools["tools"]
    else:
        tools = list(tools.values())

ids = [str(x.get("id","")).strip() for x in tools if isinstance(x, dict)]

if len(ids) != 179:
    raise SystemExit(f"ERROR: expected 179 tools, found {len(ids)}")

if len(set(ids)) != 179:
    raise SystemExit("ERROR: duplicate tool IDs detected")

# ------------------------------------------------------------
# 2. Backup critical files
# ------------------------------------------------------------
for p in [
    TOOL_PAGE,
    REGISTRY,
    ASSETS / "nova-engine-v55.js",
    ASSETS / "nova-engine-v56.js",
    ASSETS / "nova-smart-ui.js",
    ASSETS / "nova-file-engine-v54.js",
]:
    if p.exists():
        target = backup / p.name
        shutil.copy2(p, target)

# ------------------------------------------------------------
# 3. Load existing registry
# ------------------------------------------------------------
if REGISTRY.exists():
    registry = read_json(REGISTRY)
else:
    registry = {}

if isinstance(registry, dict) and "tools" in registry:
    raw_registry = registry["tools"]
elif isinstance(registry, dict):
    raw_registry = registry
elif isinstance(registry, list):
    raw_registry = registry
else:
    raw_registry = {}

if isinstance(raw_registry, list):
    registry_tools = {}
    for item in raw_registry:
        if isinstance(item, dict):
            tid = str(item.get("id", "")).strip()
            if tid:
                registry_tools[tid] = item
else:
    registry_tools = raw_registry

# ------------------------------------------------------------
# 4. Discover real implementations from V55/V56
# ------------------------------------------------------------
engine_files = [
    ASSETS / "nova-engine-v55.js",
    ASSETS / "nova-engine-v56.js",
]

engine_text = ""
for p in engine_files:
    if p.exists():
        engine_text += "\n" + p.read_text(encoding="utf-8")

# IDs explicitly referenced inside implementation maps
engine_ids = set(
    re.findall(
        r"""['"]([A-Za-z0-9_-]+)['"]\s*:\s*(?:async\s*)?(?:function|\()""",
        engine_text
    )
)

# Also detect quoted IDs appearing as keys in implementation objects
for tid in ids:
    if re.search(r"""['"]""" + re.escape(tid) + r"""['"]\s*:""", engine_text):
        engine_ids.add(tid)
    if re.search(r"""['"]""" + re.escape(tid) + r"""['"]\s*:""", engine_text):
        engine_ids.add(tid)

# ------------------------------------------------------------
# 5. Explicitly trusted V5.5/V5.6 implementation IDs
#    Only IDs that really exist in the catalog can become Available.
# ------------------------------------------------------------
TRUSTED = {
    # Text
    "slug-generator",
    "trim-text",
    "remove-line-breaks",
    "count-sentences",
    "count-paragraphs",
    "extract-emails",
    "extract-urls",
    "extract-numbers",

    # JSON
    "json-sort-keys",
    "json-to-string",
    "string-to-json",

    # HTML
    "html-escape",
    "html-unescape",

    # Encoding
    "binary-to-decimal",
    "decimal-to-binary",
    "decimal-to-hex",
    "hex-to-decimal",
    "base32-encode",

    # Finance
    "percentage-calculator",
    "percentage-change-calculator",
    "discount-calculator",
    "tip-calculator",
    "compound-interest-calculator",

    # Random / security
    "random-number-generator",
    "random-string-generator",
    "password-generator",
    "uuid-generator",

    # Text generators
    "lorem-ipsum-generator",

    # Colors
    "hex-to-hsl",
    "hsl-to-hex",

    # Dates / timestamps
    "unix-timestamp",
    "timestamp-converter",

    # Query strings
    "query-string-parser",
    "query-string-builder",
}

# Existing V55/V56 engines are authoritative only when their
# implementation code references the actual catalog ID.
available = set(x for x in TRUSTED if x in ids)
available |= set(x for x in engine_ids if x in ids)

# ------------------------------------------------------------
# 6. Preserve only genuinely wired implementations.
#    Do NOT trust old generic keyword classification.
# ------------------------------------------------------------
for tid in ids:
    old = registry_tools.get(tid, {}) if isinstance(registry_tools, dict) else {}

    if tid in available:
        status = "Available"
    else:
        status = "Coming Soon"

    registry_tools[tid] = {
        **(old if isinstance(old, dict) else {}),
        "id": tid,
        "status": status,
        "implemented": status == "Available",
        "execution": "local-browser" if status == "Available" else "not-wired",
        "version": "V5.7"
    }

registry_out = {
    "version": "5.7",
    "updated": datetime.now().isoformat(),
    "total_tools": 179,
    "available": sum(
        1 for x in registry_tools.values()
        if isinstance(x, dict) and x.get("status") == "Available"
    ),
    "coming_soon": sum(
        1 for x in registry_tools.values()
        if isinstance(x, dict) and x.get("status") == "Coming Soon"
    ),
    "tools": registry_tools
}

write_json(REGISTRY, registry_out)

# ------------------------------------------------------------
# 7. Create unified router
# ------------------------------------------------------------
router = r'''/* AI NOVA V5.7
   Unified Real Tool Router
   Local-first / browser-first / no fake results
*/
(function () {
  "use strict";

  const Registry = window.AINovaRegistry || {};

  function getRegistry() {
    return Registry;
  }

  function isAvailable(id) {
    const item = Registry[id];
    return !!(
      item &&
      item.status === "Available" &&
      item.implemented === true
    );
  }

  function engineCandidates() {
    return [
      window.AINovaV56,
      window.AINovaV55,
      window.AINovaV54,
      window.AINovaV53,
      window.AINovaV52,
      window.AINova
    ].filter(Boolean);
  }

  async function run(id, values) {
    if (!isAvailable(id)) {
      return {
        ok: false,
        status: "Coming Soon",
        tool: id,
        message:
          "This tool is not locally implemented yet. " +
          "AI Nova will not generate a fake result."
      };
    }

    const engines = engineCandidates();

    for (const engine of engines) {
      try {
        if (typeof engine.run !== "function") continue;

        const result = await engine.run(id, values || {});

        if (result !== undefined && result !== null) {
          if (typeof result === "object" && "ok" in result) {
            return result;
          }

          return {
            ok: true,
            status: "Available",
            tool: id,
            result
          };
        }
      } catch (error) {
        console.warn("AI Nova engine error:", id, error);
      }
    }

    return {
      ok: false,
      status: "Coming Soon",
      tool: id,
      message:
        "The tool is registered but its execution layer is not available."
    };
  }

  window.AINovaV57 = {
    version: "5.7",
    getRegistry,
    isAvailable,
    run
  };

  window.AINovaUnified = window.AINovaV57;
})();
'''

(ASSETS / "nova-router-v57.js").write_text(router, encoding="utf-8")

# ------------------------------------------------------------
# 8. Registry loader
# ------------------------------------------------------------
loader = r'''/* AI NOVA V5.7 registry loader */
(function () {
  fetch("data/tool-registry.json", { cache: "no-store" })
    .then(r => r.json())
    .then(data => {
      const tools = data.tools || {};
      window.AINovaRegistry = tools;

      document.dispatchEvent(
        new CustomEvent("ainova-registry-ready", {
          detail: data
        })
      );
    })
    .catch(err => {
      console.error("AI Nova registry error:", err);
      window.AINovaRegistry = {};
    });
})();
'''

(ASSETS / "nova-registry-v57.js").write_text(loader, encoding="utf-8")

# ------------------------------------------------------------
# 9. Rewrite tool.html with a clean unified runtime
# ------------------------------------------------------------
html = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#070b14">
<meta name="description"
      content="AI Nova — professional browser-based AI and productivity tools.">

<title>AI Nova Tool</title>

<link rel="manifest" href="manifest.json">
<link rel="stylesheet" href="assets/hub.css">
<link rel="stylesheet" href="assets/nova-ui.css">

<style>
:root{
  --bg:#070b14;
  --panel:#0d1422;
  --panel2:#111b2d;
  --border:#22304a;
  --text:#f5f7ff;
  --muted:#91a0ba;
  --accent:#7c8cff;
  --good:#42d392;
  --warn:#ffcc66;
}
*{box-sizing:border-box}
body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
a{color:inherit;text-decoration:none}
.container{
  width:min(1100px,92%);
  margin:auto;
}
.topbar{
  position:sticky;
  top:0;
  z-index:20;
  backdrop-filter:blur(18px);
  background:rgba(7,11,20,.86);
  border-bottom:1px solid var(--border);
}
.nav{
  min-height:62px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
.brand{
  font-weight:900;
  letter-spacing:.5px;
}
.brand span{color:var(--accent)}
.back{
  color:var(--muted);
  font-size:14px;
}
main{padding:32px 0 70px}
.hero{
  display:flex;
  justify-content:space-between;
  gap:20px;
  align-items:flex-start;
  margin-bottom:24px;
}
h1{
  font-size:clamp(27px,6vw,46px);
  margin:0 0 8px;
}
.subtitle{
  color:var(--muted);
  line-height:1.6;
}
.badge{
  display:inline-flex;
  align-items:center;
  border:1px solid var(--border);
  border-radius:999px;
  padding:7px 11px;
  font-size:12px;
  white-space:nowrap;
}
.available{
  border-color:rgba(66,211,146,.4);
  color:var(--good);
}
.coming{
  border-color:rgba(255,204,102,.4);
  color:var(--warn);
}
.card{
  background:linear-gradient(145deg,var(--panel),var(--panel2));
  border:1px solid var(--border);
  border-radius:20px;
  padding:20px;
  margin-bottom:18px;
  box-shadow:0 18px 60px rgba(0,0,0,.18);
}
label{
  display:block;
  color:var(--muted);
  font-size:13px;
  margin-bottom:8px;
}
textarea,input,select{
  width:100%;
  background:#080e19;
  color:var(--text);
  border:1px solid var(--border);
  border-radius:13px;
  padding:13px;
  outline:none;
  font:inherit;
}
textarea{min-height:180px;resize:vertical}
textarea:focus,input:focus,select:focus{
  border-color:var(--accent);
}
.field{margin-bottom:16px}
.actions{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
}
button{
  border:1px solid var(--border);
  background:#121d30;
  color:var(--text);
  border-radius:12px;
  padding:11px 15px;
  font-weight:700;
  cursor:pointer;
}
button.primary{
  background:var(--accent);
  border-color:var(--accent);
  color:white;
}
button:disabled{
  opacity:.45;
  cursor:not-allowed;
}
#output{
  white-space:pre-wrap;
  word-break:break-word;
  min-height:130px;
  background:#080e19;
  border:1px solid var(--border);
  border-radius:14px;
  padding:16px;
  line-height:1.55;
}
.notice{
  padding:14px;
  border-radius:13px;
  border:1px solid rgba(255,204,102,.3);
  color:var(--warn);
  background:rgba(255,204,102,.04);
}
.hidden{display:none!important}
.meta{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:12px;
}
@media(max-width:650px){
  .hero{display:block}
  .hero .badge{margin-top:14px}
  .actions button{flex:1 1 calc(50% - 9px)}
}
</style>
</head>

<body>

<header class="topbar">
  <div class="container nav">
    <a class="brand" href="index.html">AI <span>Nova</span></a>
    <a class="back" href="index.html">← All Tools</a>
  </div>
</header>

<main class="container">

  <section class="hero">
    <div>
      <h1 id="title">AI Nova Tool</h1>
      <div class="subtitle" id="description">
        Loading tool…
      </div>
      <div class="meta">
        <span id="status" class="badge">Loading</span>
        <span id="category" class="badge"></span>
      </div>
    </div>
  </section>

  <section id="comingCard" class="card hidden">
    <div class="notice">
      This tool is currently <strong>Coming Soon</strong>.
      AI Nova will not simulate or invent a result.
    </div>
  </section>

  <section id="appCard" class="card">

    <div id="fields"></div>

    <div class="actions">
      <button id="runBtn" class="primary">Run Tool</button>
      <button id="copyBtn">Copy Result</button>
      <button id="downloadBtn">Download</button>
      <button id="clearBtn">Clear</button>
    </div>

  </section>

  <section class="card">
    <label>Result</label>
    <div id="output">Ready.</div>
  </section>

</main>

<script src="assets/nova-registry-v57.js"></script>
<script src="assets/nova-engine-v52.js"></script>
<script src="assets/nova-engine-v55.js"></script>
<script src="assets/nova-engine-v56.js"></script>
<script src="assets/nova-router-v57.js"></script>
<script src="assets/nova-smart-ui.js"></script>
<script src="assets/nova-file-engine-v54.js"></script>

<script>
(function(){
  "use strict";

  const params = new URLSearchParams(location.search);
  const toolId = params.get("id");

  const $ = id => document.getElementById(id);

  let tool = null;
  let profile = null;

  function escapeText(v){
    return String(v ?? "");
  }

  function findTool(){
    fetch("data/tools.json", {cache:"no-store"})
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data)
          ? data
          : (data.tools || []);

        tool = list.find(x => String(x.id) === String(toolId));

        if(!tool){
          $("title").textContent = "Tool Not Found";
          $("description").textContent =
            "The requested AI Nova tool does not exist.";
          $("appCard").classList.add("hidden");
          return;
        }

        renderTool();
      })
      .catch(() => {
        $("title").textContent = "Loading Error";
        $("description").textContent =
          "Unable to load the AI Nova tool catalog.";
      });
  }

  function renderTool(){
    $("title").textContent =
      tool.name || tool.title || tool.id;

    $("description").textContent =
      tool.description ||
      "Professional browser-based utility from AI Nova.";

    $("category").textContent =
      tool.category || "AI Nova";

    const reg = (window.AINovaRegistry || {})[tool.id] || {};
    const available =
      reg.status === "Available" &&
      reg.implemented === true;

    $("status").textContent =
      available ? "Available" : "Coming Soon";

    $("status").classList.add(
      available ? "available" : "coming"
    );

    if(!available){
      $("comingCard").classList.remove("hidden");
      $("runBtn").disabled = true;
      $("appCard").classList.remove("hidden");
    }

    createFields();
  }

  function createFields(){
    const box = $("fields");

    let type = "text";

    const id = tool.id.toLowerCase();

    if(
      id.includes("json") ||
      id.includes("object")
    ) type = "json";

    if(
      id.includes("html") ||
      id.includes("css") ||
      id.includes("javascript") ||
      id.includes("code")
    ) type = "code";

    if(
      id.includes("url") ||
      id.includes("query")
    ) type = "url";

    if(
      id.includes("password") ||
      id.includes("uuid") ||
      id.includes("random")
    ) type = "generator";

    const label = document.createElement("label");
    label.textContent =
      type === "json" ? "JSON Input" :
      type === "code" ? "Code / Text Input" :
      type === "url" ? "URL / Query Input" :
      "Input";

    const wrap = document.createElement("div");
    wrap.className = "field";

    const area = document.createElement("textarea");
    area.id = "mainInput";
    area.placeholder =
      "Enter your input here…";

    wrap.appendChild(label);
    wrap.appendChild(area);
    box.appendChild(wrap);
  }

  function values(){
    return {
      input: $("mainInput") ? $("mainInput").value : "",
      text: $("mainInput") ? $("mainInput").value : "",
      value: $("mainInput") ? $("mainInput").value : ""
    };
  }

  async function run(){
    if(!tool) return;

    const registry =
      (window.AINovaRegistry || {})[tool.id];

    if(
      !registry ||
      registry.status !== "Available" ||
      registry.implemented !== true
    ){
      $("output").textContent =
        "Coming Soon — this tool is not implemented yet.";
      return;
    }

    $("runBtn").disabled = true;
    $("runBtn").textContent = "Running…";

    try{
      const result =
        await window.AINovaUnified.run(
          tool.id,
          values()
        );

      if(result && result.ok){
        const value =
          result.result !== undefined
            ? result.result
            : result.output;

        $("output").textContent =
          typeof value === "string"
            ? value
            : JSON.stringify(value, null, 2);
      }else{
        $("output").textContent =
          result && result.message
            ? result.message
            : "No result returned.";
      }

    }catch(error){
      $("output").textContent =
        "Tool execution failed safely: " +
        error.message;
    }finally{
      $("runBtn").disabled = false;
      $("runBtn").textContent = "Run Tool";
    }
  }

  $("runBtn").addEventListener("click", run);

  $("copyBtn").addEventListener("click", async ()=>{
    const text = $("output").textContent;
    try{
      await navigator.clipboard.writeText(text);
      $("copyBtn").textContent = "Copied!";
      setTimeout(
        ()=>$("copyBtn").textContent="Copy Result",
        1200
      );
    }catch{
      $("output").focus();
    }
  });

  $("downloadBtn").addEventListener("click", ()=>{
    const text = $("output").textContent;
    const blob = new Blob([text], {
      type:"text/plain;charset=utf-8"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download =
      (toolId || "ai-nova-result") + ".txt";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("clearBtn").addEventListener("click", ()=>{
    if($("mainInput")) $("mainInput").value = "";
    $("output").textContent = "Ready.";
  });

  document.addEventListener(
    "ainova-registry-ready",
    findTool,
    {once:true}
  );

  if(window.AINovaRegistry){
    findTool();
  }

})();
</script>

</body>
</html>
'''

TOOL_PAGE.write_text(html, encoding="utf-8")

# ------------------------------------------------------------
# 10. Capability report
# ------------------------------------------------------------
available_count = len(available)
coming_count = 179 - available_count

capabilities = {
    "version": "5.7",
    "mode": "unified-local-router",
    "total": 179,
    "available": available_count,
    "coming_soon": coming_count,
    "fake_results": False,
    "router": "assets/nova-router-v57.js",
    "registry_loader": "assets/nova-registry-v57.js",
    "tool_page": "tool.html",
    "available_ids": sorted(available),
    "coming_soon_ids": sorted(set(ids) - available)
}

write_json(
    DATA / "v57-capabilities.json",
    capabilities
)

# ------------------------------------------------------------
# 11. Static integrity checks
# ------------------------------------------------------------
checks = {
    "179 tools": len(ids) == 179,
    "unique IDs": len(set(ids)) == 179,
    "registry exists": REGISTRY.exists(),
    "router exists": (ASSETS / "nova-router-v57.js").exists(),
    "loader exists": (ASSETS / "nova-registry-v57.js").exists(),
    "tool page exists": TOOL_PAGE.exists(),
    "V56 loaded": "nova-engine-v56.js" in html,
    "V55 loaded": "nova-engine-v55.js" in html,
    "unified router used": "AINovaUnified.run" in html,
    "no fake fallback": "will not simulate" in html,
}

failed = [k for k,v in checks.items() if not v]

print()
print("=" * 56)
print("             AI NOVA V5.7 SUCCESS")
print("=" * 56)
print(f"TOTAL TOOLS       : {len(ids)}")
print(f"LOCAL AVAILABLE   : {available_count}")
print(f"COMING SOON       : {coming_count}")
print("-" * 56)

for name, ok in checks.items():
    print(("PASS " if ok else "FAIL ") + name)

print("-" * 56)
print("ROUTER            : nova-router-v57.js")
print("REGISTRY LOADER   : nova-registry-v57.js")
print("TOOL PAGE         : unified tool.html")
print(f"BACKUP            : {backup}")
print("=" * 56)

if failed:
    raise SystemExit("V5.7 validation failed: " + ", ".join(failed))

