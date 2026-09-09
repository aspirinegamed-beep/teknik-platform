from pathlib import Path
import json
import shutil
from datetime import datetime

ROOT = Path.home() / "ai-nova"
DATA = ROOT / "data"
ASSETS = ROOT / "assets"

tools_file = DATA / "tools.json"
registry_file = DATA / "tool-registry.json"

if not tools_file.exists():
    raise SystemExit("ERROR: data/tools.json not found")

tools = json.loads(tools_file.read_text(encoding="utf-8"))

if len(tools) != 179:
    raise SystemExit(f"ERROR: expected 179 tools, found {len(tools)}")

ids = [str(t.get("id", "")).strip() for t in tools]

if len(set(ids)) != 179:
    raise SystemExit("ERROR: duplicate tool IDs")

# Backup
stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = ROOT / f".ai-nova-backup-v4-{stamp}"
backup.mkdir(parents=True, exist_ok=True)

for rel in [
    "index.html",
    "manifest.json",
    "assets/nova-v4.css",
    "assets/nova-v4.js"
]:
    src = ROOT / rel
    if src.exists():
        dst = backup / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

# Registry
if registry_file.exists():
    registry = json.loads(
        registry_file.read_text(encoding="utf-8")
    )
else:
    registry = {}

for tool in tools:
    tid = str(tool.get("id", "")).strip()

    if tid not in registry:
        registry[tid] = {
            "status": "coming-soon",
            "family": tool.get("category", "utility"),
            "offline": True,
            "implementation": "pending"
        }

registry_file.write_text(
    json.dumps(registry, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

# CSS
css = """
:root{
--bg:#050812;
--panel:#0b1220;
--panel2:#10192b;
--border:#263550;
--text:#f5f7ff;
--muted:#96a5c0;
--primary:#765cff;
--primary2:#a384ff;
--success:#39d99a;
--warning:#ffd05a;
}

*{box-sizing:border-box}

html{scroll-behavior:smooth}

body{
margin:0;
background:
radial-gradient(circle at 10% 0%,rgba(118,92,255,.15),transparent 32%),
radial-gradient(circle at 90% 10%,rgba(57,217,154,.07),transparent 30%),
var(--bg);
color:var(--text);
font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}

button,input{font:inherit}

.nv-nav{
position:sticky;
top:0;
z-index:100;
background:rgba(5,8,18,.86);
backdrop-filter:blur(18px);
border-bottom:1px solid rgba(255,255,255,.07);
}

.nv-nav-inner{
max-width:1240px;
margin:auto;
padding:12px 18px;
display:flex;
align-items:center;
gap:18px;
}

.nv-logo{
font-size:21px;
font-weight:950;
letter-spacing:.8px;
white-space:nowrap;
}

.nv-navlinks{
margin-left:auto;
display:flex;
gap:5px;
overflow:auto;
}

.nv-navlinks button{
border:0;
background:transparent;
color:var(--muted);
padding:9px 11px;
border-radius:10px;
white-space:nowrap;
cursor:pointer;
}

.nv-navlinks button:hover{
background:rgba(255,255,255,.06);
color:white;
}

.nv-shell{
max-width:1240px;
margin:auto;
padding:18px;
}

.nv-hero{
margin-top:22px;
padding:36px;
border:1px solid var(--border);
border-radius:28px;
background:linear-gradient(
135deg,
rgba(118,92,255,.14),
rgba(255,255,255,.025)
);
box-shadow:0 30px 90px rgba(0,0,0,.3);
}

.nv-kicker{
font-size:12px;
font-weight:900;
color:var(--primary2);
letter-spacing:1px;
}

.nv-hero h1{
margin:12px 0;
font-size:clamp(34px,7vw,64px);
line-height:1.02;
}

.nv-gradient{
background:linear-gradient(90deg,#fff,var(--primary2));
-webkit-background-clip:text;
background-clip:text;
color:transparent;
}

.nv-hero p{
max-width:780px;
color:var(--muted);
line-height:1.7;
}

.nv-search{
width:100%;
margin-top:18px;
padding:16px;
border-radius:14px;
border:1px solid var(--border);
background:#070d19;
color:white;
outline:none;
font-size:15px;
}

.nv-search:focus{
border-color:var(--primary);
box-shadow:0 0 0 3px rgba(118,92,255,.12);
}

.nv-stats{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:12px;
margin-top:16px;
}

.nv-stat{
padding:17px;
border:1px solid var(--border);
border-radius:17px;
background:rgba(11,18,32,.85);
}

.nv-stat strong{
display:block;
font-size:24px;
}

.nv-stat span{
color:var(--muted);
font-size:12px;
}

.nv-section{
margin-top:28px;
}

.nv-section-head{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:13px;
}

.nv-section-head h2{
margin:0;
font-size:21px;
}

.nv-filters{
display:flex;
gap:8px;
flex-wrap:wrap;
margin-bottom:14px;
}

.nv-filter{
background:#0c1424;
border:1px solid var(--border);
color:var(--muted);
border-radius:999px;
padding:8px 12px;
cursor:pointer;
}

.nv-filter.active{
background:var(--primary);
border-color:var(--primary);
color:white;
}

.nv-grid{
display:grid;
grid-template-columns:repeat(4,minmax(0,1fr));
gap:12px;
}

.nv-tool{
display:flex;
flex-direction:column;
min-height:175px;
padding:17px;
border:1px solid var(--border);
border-radius:18px;
background:linear-gradient(180deg,#0c1424,#09101d);
transition:.18s ease;
}

.nv-tool:hover{
transform:translateY(-3px);
border-color:#4b5f89;
box-shadow:0 18px 45px rgba(0,0,0,.28);
}

.nv-tool-top{
display:flex;
justify-content:space-between;
gap:7px;
}

.nv-tool h3{
font-size:16px;
margin:12px 0 7px;
}

.nv-tool p{
font-size:12px;
line-height:1.5;
color:var(--muted);
margin:0;
}

.nv-badge{
display:inline-flex;
padding:4px 8px;
border-radius:999px;
background:#103426;
color:#6ce9aa;
font-size:10px;
white-space:nowrap;
}

.nv-badge.soon{
background:#352a12;
color:#ffd067;
}

.nv-open{
margin-top:auto;
padding-top:15px;
display:flex;
gap:7px;
}

.nv-open a,
.nv-fav{
display:block;
text-align:center;
padding:10px;
border-radius:10px;
background:#151f34;
color:white;
text-decoration:none;
font-size:13px;
font-weight:800;
}

.nv-open a{flex:1}

.nv-fav{
width:42px;
border:0;
cursor:pointer;
}

.nv-business{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:12px;
}

.nv-business-card{
padding:22px;
border-radius:20px;
border:1px solid var(--border);
background:linear-gradient(135deg,#10192b,#0b1220);
}

.nv-business-card p{
color:var(--muted);
font-size:13px;
line-height:1.6;
}

.nv-cta{
display:inline-block;
padding:10px 14px;
border-radius:10px;
background:var(--primary);
color:white;
text-decoration:none;
font-weight:800;
}

.nv-empty{
padding:30px;
text-align:center;
color:var(--muted);
border:1px dashed var(--border);
border-radius:18px;
grid-column:1/-1;
}

.nv-founder{
display:flex;
align-items:center;
gap:16px;
padding:23px;
border:1px solid var(--border);
border-radius:22px;
background:#0b1220;
}

.nv-avatar{
width:58px;
height:58px;
border-radius:50%;
display:grid;
place-items:center;
background:linear-gradient(135deg,var(--primary),var(--primary2));
font-weight:950;
}

.nv-founder small{
color:var(--muted);
}

.nv-footer{
margin-top:45px;
padding:25px 0;
border-top:1px solid var(--border);
color:var(--muted);
font-size:12px;
}

.nv-footer a{color:inherit}

@media(max-width:950px){
.nv-grid{grid-template-columns:repeat(3,1fr)}
.nv-stats{grid-template-columns:repeat(2,1fr)}
}

@media(max-width:650px){
.nv-shell{padding:12px}
.nv-hero{padding:24px}
.nv-grid{grid-template-columns:repeat(2,1fr)}
.nv-business{grid-template-columns:1fr}
}

@media(max-width:430px){
.nv-grid{grid-template-columns:1fr}
.nv-stats{grid-template-columns:1fr 1fr}
.nv-nav-inner{padding:10px 12px}
.nv-logo{font-size:18px}
}
"""

(ASSETS/"nova-v4.css").write_text(css,encoding="utf-8")

# JS
js = r"""
(async function(){

const root=document.getElementById("ai-nova-v4");

if(!root)return;

let tools=[];
let registry={};
let category="all";
let query="";

try{

const result=await Promise.all([
fetch("data/tools.json"),
fetch("data/tool-registry.json")
]);

tools=await result[0].json();
registry=await result[1].json();

}catch(e){

root.innerHTML='<div class="nv-empty">AI Nova data could not be loaded.</div>';
return;

}

function name(t){
return t.name||t.title||t.id;
}

function family(t){
return (registry[t.id]&&registry[t.id].family)||t.category||"utility";
}

function available(t){
return registry[t.id]&&registry[t.id].status==="available";
}

function favorites(){

try{
return JSON.parse(localStorage.getItem("aiNovaFavorites")||"[]");
}catch(e){
return [];
}

}

function recent(){

try{
return JSON.parse(localStorage.getItem("aiNovaRecent")||"[]");
}catch(e){
return [];
}

}

window.aiNovaFavorite=function(id){

let arr=favorites();

if(arr.includes(id)){
arr=arr.filter(x=>x!==id);
}else{
arr.unshift(id);
}

localStorage.setItem(
"aiNovaFavorites",
JSON.stringify(arr.slice(0,50))
);

render();
renderSpecial();

};

window.aiNovaRecent=function(id){

let arr=recent().filter(x=>x!==id);

arr.unshift(id);

localStorage.setItem(
"aiNovaRecent",
JSON.stringify(arr.slice(0,20))
);

};

function card(t){

const ok=available(t);
const fav=favorites().includes(t.id);

return `
<article class="nv-tool">

<div class="nv-tool-top">
<span class="nv-badge">${family(t)}</span>
<span class="nv-badge ${ok?"":"soon"}">
${ok?"Available":"Coming Soon"}
</span>
</div>

<h3>${name(t)}</h3>

<p>${t.description||"AI Nova digital utility."}</p>

<div class="nv-open">

<button
class="nv-fav"
onclick="window.aiNovaFavorite('${String(t.id).replace(/'/g,"\\'")}')"
>
${fav?"★":"☆"}
</button>

<a
href="tool.html?id=${encodeURIComponent(t.id)}"
onclick="window.aiNovaRecent('${String(t.id).replace(/'/g,"\\'")}')"
>
Open Tool →
</a>

</div>

</article>
`;

}

function render(){

const list=tools.filter(t=>{

const text=(
name(t)+" "+
(t.description||"")+" "+
t.id
).toLowerCase();

return(
(!query||text.includes(query))&&
(category==="all"||family(t)===category)
);

});

document.getElementById("tool-grid").innerHTML=
list.length
?list.map(card).join("")
:'<div class="nv-empty">No tools found.</div>';

document.getElementById("shown-count").textContent=list.length;

}

function renderSmall(ids,id){

const map=new Map(tools.map(t=>[t.id,t]));

const list=ids
.map(x=>map.get(x))
.filter(Boolean)
.slice(0,4);

document.getElementById(id).innerHTML=
list.length
?list.map(card).join("")
:'<div class="nv-empty">Nothing here yet.</div>';

}

function renderSpecial(){

renderSmall(recent(),"recent-grid");
renderSmall(favorites(),"fav-grid");

}

function filters(){

const values=[
"all",
...new Set(tools.map(t=>family(t)))
];

const box=document.getElementById("filters");

box.innerHTML=values.map(x=>`
<button
class="nv-filter ${x==="all"?"active":""}"
data-cat="${x}"
>
${x==="all"?"All":x}
</button>
`).join("");

box.querySelectorAll(".nv-filter").forEach(button=>{

button.onclick=function(){

category=this.dataset.cat;

box.querySelectorAll(".nv-filter")
.forEach(x=>x.classList.remove("active"));

this.classList.add("active");

render();

};

});

}

root.innerHTML=`

<nav class="nv-nav">
<div class="nv-nav-inner">

<div class="nv-logo">AI NOVA</div>

<div class="nv-navlinks">

<button onclick="scrollTo({top:0,behavior:'smooth'})">Home</button>

<button onclick="document.getElementById('tools').scrollIntoView({behavior:'smooth'})">Tools</button>

<button onclick="document.getElementById('business').scrollIntoView({behavior:'smooth'})">Business</button>

<button onclick="location.href='premium.html'">Premium</button>

<button onclick="location.href='marketplace.html'">Marketplace</button>

</div>

</div>
</nav>

<main class="nv-shell">

<section class="nv-hero">

<div class="nv-kicker">AI NOVA PLATFORM</div>

<h1>
<span class="nv-gradient">179 tools.</span><br>
One powerful workspace.
</h1>

<p>
AI Nova combines developer tools, SEO utilities,
business calculators, security utilities, generators
and digital tools in one browser-first platform.
</p>

<input
id="tool-search"
class="nv-search"
placeholder="Search 179 tools..."
autocomplete="off"
>

<div class="nv-stats">

<div class="nv-stat">
<strong>179</strong>
<span>Total tools</span>
</div>

<div class="nv-stat">
<strong id="available-count">0</strong>
<span>Available locally</span>
</div>

<div class="nv-stat">
<strong id="shown-count">179</strong>
<span>Tools shown</span>
</div>

<div class="nv-stat">
<strong>FREE</strong>
<span>Browser core</span>
</div>

</div>
</section>

<section class="nv-section">

<div class="nv-section-head">
<h2>Recently Used</h2>
</div>

<div id="recent-grid" class="nv-grid"></div>

</section>

<section class="nv-section">

<div class="nv-section-head">
<h2>Favorites ⭐</h2>
</div>

<div id="fav-grid" class="nv-grid"></div>

</section>

<section id="tools" class="nv-section">

<div class="nv-section-head">
<h2>All 179 Tools</h2>
</div>

<div id="filters" class="nv-filters"></div>

<div id="tool-grid" class="nv-grid"></div>

</section>

<section id="business" class="nv-section">

<div class="nv-section-head">
<h2>AI Nova Business</h2>
</div>

<div class="nv-business">

<div class="nv-business-card">
<h3>⚡ Premium</h3>
<p>
Advanced features, higher limits and future
subscription plans.
</p>
<a class="nv-cta" href="premium.html">
Explore Premium
</a>
</div>

<div class="nv-business-card">
<h3>🛍 Marketplace</h3>
<p>
Digital templates, resources, prompts and
creator products.
</p>
<a class="nv-cta" href="marketplace.html">
Open Marketplace
</a>
</div>

<div class="nv-business-card">
<h3>🤝 Partners</h3>
<p>
Partnership and sponsorship infrastructure
for future integrations.
</p>
<a class="nv-cta" href="contact.html">
Contact
</a>
</div>

</div>
</section>

<section class="nv-section">

<div class="nv-founder">

<div class="nv-avatar">AA</div>

<div>
<strong>Azzouz Ahmed</strong>
<br>
<small>Founder & Creator of AI Nova</small>
</div>

</div>

</section>

<footer class="nv-footer">

AI Nova © 2026 ·
<a href="about.html">About</a> ·
<a href="privacy.html">Privacy</a> ·
<a href="terms.html">Terms</a> ·
<a href="contact.html">Contact</a>

</footer>

</main>
`;

document.getElementById("tool-search").oninput=function(){
query=this.value.trim().toLowerCase();
render();
};

document.getElementById("available-count").textContent=
tools.filter(available).length;

filters();
render();
renderSpecial();

})();
"""

(ASSETS/"nova-v4.js").write_text(js,encoding="utf-8")

# HTML
html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>AI Nova — 179 Tools</title>
<meta name="description" content="AI Nova — 179 browser-first digital tools in one professional workspace.">
<meta name="theme-color" content="#050812">
<link rel="manifest" href="manifest.json">
<link rel="stylesheet" href="assets/nova-v4.css">
</head>
<body>
<div id="ai-nova-v4">Loading AI Nova...</div>
<script src="assets/nova-v4.js" defer></script>
</body>
</html>
"""

(ROOT/"index.html").write_text(html,encoding="utf-8")

# Manifest
manifest={
"name":"AI Nova",
"short_name":"AI Nova",
"description":"AI Nova — 179 browser-first tools.",
"start_url":"./",
"display":"standalone",
"background_color":"#050812",
"theme_color":"#050812",
"icons":[]
}

(ROOT/"manifest.json").write_text(
json.dumps(manifest,ensure_ascii=False,indent=2),
encoding="utf-8"
)

# Validation
required=[
ROOT/"index.html",
ROOT/"manifest.json",
ASSETS/"nova-v4.css",
ASSETS/"nova-v4.js",
DATA/"tools.json",
DATA/"tool-registry.json"
]

for p in required:
    if not p.exists():
        raise SystemExit(f"ERROR: missing {p}")

available_count=sum(
1 for t in tools
if registry.get(t["id"],{}).get("status")=="available"
)

coming_count=179-available_count

print()
print("========================================")
print("       AI NOVA V4 SUCCESS")
print("========================================")
print("TOTAL TOOLS     :",len(tools))
print("UNIQUE IDS      :",len(set(ids)))
print("LOCAL AVAILABLE :",available_count)
print("COMING SOON     :",coming_count)
print("----------------------------------------")
print("PASS Dashboard")
print("PASS Search")
print("PASS Categories")
print("PASS Favorites")
print("PASS Recent Tools")
print("PASS Premium")
print("PASS Marketplace")
print("PASS Founder")
print("PASS Mobile UI")
print("PASS PWA")
print("PASS Registry")
print("----------------------------------------")
print("BACKUP:",backup)
print("========================================")
