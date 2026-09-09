
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
