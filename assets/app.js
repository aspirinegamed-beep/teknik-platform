const translations={
en:{
latest:"Latest",
aiTools:"AI Tools",
android:"Android",
guides:"Guides",
security:"Security",
eyebrow:"SMARTER DIGITAL LIFE",
heroTitle:"Find the tools that make digital work easier.",
heroText:"Practical guides, AI tools, Android apps and comparisons — explained simply and built for real-world use.",
explore:"Explore articles",
subscribe:"Get updates",
latestTitle:"Latest insights",
search:"Search articles...",
aiTitle:"AI tools worth knowing",
aiText:"Curated tools, workflows and practical use cases without the hype.",
androidTitle:"Android, simplified",
guidesTitle:"Built for action",
guidesText:"Every guide is designed to answer a question and lead to a useful next step.",
newsTitle:"Useful updates. No noise.",
newsText:"Get practical digital tips and useful updates.",
join:"Join",
readMore:"Read more →",
all:"All",
noResults:"No matching articles found.",
subscribed:"You're subscribed. Welcome to AI PLADUOM!",
copy:"Copy link",
copied:"Link copied!"
},

ar:{
latest:"الأحدث",
aiTools:"أدوات الذكاء الاصطناعي",
android:"أندرويد",
guides:"أدلة",
security:"الأمان",
eyebrow:"حياة رقمية أذكى",
heroTitle:"اكتشف الأدوات التي تجعل العمل الرقمي أسهل.",
heroText:"أدلة عملية وأدوات ذكاء اصطناعي وتطبيقات Android ومقارنات مفهومة.",
explore:"استكشف المقالات",
subscribe:"احصل على التحديثات",
latestTitle:"أحدث المحتوى",
search:"ابحث في المقالات...",
aiTitle:"أدوات AI تستحق المعرفة",
aiText:"أدوات وسير عمل واستخدامات عملية بدون مبالغة.",
androidTitle:"Android بشكل أبسط",
guidesTitle:"مصمم للتطبيق",
guidesText:"كل دليل يجيب عن سؤال ويقودك إلى خطوة عملية.",
newsTitle:"تحديثات مفيدة بدون ضجيج",
newsText:"احصل على نصائح رقمية وتحديثات مفيدة.",
join:"اشترك",
readMore:"اقرأ المزيد ←",
all:"الكل",
noResults:"لم نجد مقالات مطابقة.",
subscribed:"تم الاشتراك بنجاح. أهلاً بك في AI PLADUOM!",
copy:"نسخ الرابط",
copied:"تم نسخ الرابط!"
},

fr:{
latest:"Nouveautés",
aiTools:"Outils IA",
android:"Android",
guides:"Guides",
security:"Sécurité",
eyebrow:"UNE VIE NUMÉRIQUE PLUS INTELLIGENTE",
heroTitle:"Trouvez les outils qui simplifient le travail numérique.",
heroText:"Guides pratiques, outils IA, applications Android et comparatifs.",
explore:"Explorer",
subscribe:"Recevoir les nouveautés",
latestTitle:"Dernières informations",
search:"Rechercher...",
aiTitle:"Outils IA à connaître",
aiText:"Des outils et cas d'usage pratiques, sans battage.",
androidTitle:"Android, simplement",
guidesTitle:"Pensé pour l'action",
guidesText:"Chaque guide répond à une question et propose une prochaine étape.",
newsTitle:"Des mises à jour utiles.",
newsText:"Recevez des conseils numériques utiles.",
join:"S'inscrire",
readMore:"Lire la suite →",
all:"Tous",
noResults:"Aucun article correspondant.",
subscribed:"Inscription réussie. Bienvenue sur AI PLADUOM !",
copy:"Copier le lien",
copied:"Lien copié !"
},

es:{
latest:"Últimos",
aiTools:"Herramientas IA",
android:"Android",
guides:"Guías",
security:"Seguridad",
eyebrow:"VIDA DIGITAL MÁS INTELIGENTE",
heroTitle:"Encuentra herramientas que facilitan el trabajo digital.",
heroText:"Guías prácticas, herramientas de IA, apps Android y comparativas.",
explore:"Explorar",
subscribe:"Recibir novedades",
latestTitle:"Últimos contenidos",
search:"Buscar artículos...",
aiTitle:"Herramientas IA que debes conocer",
aiText:"Herramientas y casos prácticos sin exageraciones.",
androidTitle:"Android, simplificado",
guidesTitle:"Hecho para actuar",
guidesText:"Cada guía responde una pregunta y lleva a un siguiente paso.",
newsTitle:"Actualizaciones útiles.",
newsText:"Recibe consejos y actualizaciones digitales.",
join:"Unirse",
readMore:"Leer más →",
all:"Todos",
noResults:"No se encontraron artículos.",
subscribed:"Suscripción realizada. ¡Bienvenido a AI PLADUOM!",
copy:"Copiar enlace",
copied:"¡Enlace copiado!"
}
};

let articles=[];


let currentLang="en";
let currentFilter="";

function escapeHTML(str){
return String(str).replace(/[&<>"']/g,m=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"
}[m]));
}

function getTranslation(){
return translations[currentLang]||translations.en;
}

function getArticleContent(article){
return article.content[currentLang]||article.content.en;
}

const tagImages={
"AI":"assets/img-ai.svg",
"ANDROID":"assets/img-android.svg",
"GUIDE":"assets/img-guide.svg",
"SECURITY":"assets/img-security.svg"
};

function getArticleImage(article){
return tagImages[article.tag]||tagImages["GUIDE"];
}

function renderArticles(){
const box=document.querySelector("#articles");
if(!box)return;

const q=currentFilter.trim().toLowerCase();

const results=articles.filter(a=>{
const c=getArticleContent(a);
const matchesSearch=(c.title+" "+c.text+" "+a.tag).toLowerCase().includes(q);
return matchesSearch;
});

const t=getTranslation();

box.innerHTML=results.length
?results.map(a=>{
const c=getArticleContent(a);
return `
<article class="article" data-tag="${escapeHTML(a.tag)}">
<img class="article-thumb" src="${getArticleImage(a)}" alt="${escapeHTML(c.title)}" loading="lazy">
<span class="tag">${escapeHTML(a.tag)}</span>
<h3>${escapeHTML(c.title)}</h3>
<p>${escapeHTML(c.text)}</p>
<div class="article-meta">
<span>${escapeHTML(a.author||"AI PLADUOM")}</span>
<span>${escapeHTML(a.date||"")}</span>
</div>
<a href="articles/${encodeURIComponent(a.id)}/" class="read-article" data-id="${escapeHTML(a.id)}">
${t.readMore}
</a>
</article>`;
}).join("")
:`<p>${t.noResults}</p>`;
}


function renderRelatedArticles(article){
const related=articles
.filter(a=>a.id!==article.id && a.tag===article.tag)
.slice(0,3);

if(!related.length)return "";

const t=getTranslation();

return `
<section class="related-section">
<h2>${escapeHTML(t.latestTitle)}</h2>
<div class="related-grid">
${related.map(a=>{
const c=getArticleContent(a);
return `
<article class="article related-card">
<img class="article-thumb" src="${getArticleImage(a)}" alt="${escapeHTML(c.title)}" loading="lazy">
<span class="tag">${escapeHTML(a.tag)}</span>
<h3>${escapeHTML(c.title)}</h3>
<p>${escapeHTML(c.text)}</p>
<a href="../${encodeURIComponent(a.id)}/" class="read-article">${t.readMore}</a>
</article>`;
}).join("")}
</div>
</section>`;
}

function renderArticlePage(id){
const article=articles.find(a=>a.id===id);
if(!article)return false;

const c=getArticleContent(article);
const t=getTranslation();
const root=document.querySelector("main");

if(!root)return false;

root.innerHTML=`
<section class="article-page section">
<div class="article-page-inner">
<a href="./" class="back-link">← ${t.latestTitle}</a>
<img class="article-hero" src="${getArticleImage(article)}" alt="${escapeHTML(article.tag)}" loading="lazy">
<span class="tag">${escapeHTML(article.tag)}</span>
<h1>${escapeHTML(c.title)}</h1>
<div class="article-meta">
<span>${escapeHTML(article.author||"AI PLADUOM")}</span>
<span>${escapeHTML(article.date||"")}</span>
</div>
<p class="article-lead">${escapeHTML(c.text)}</p>
<div class="article-body">
${c.body.split("\n\n").map(p=>`<p>${escapeHTML(p)}</p>`).join("")}
</div>

<div class="article-tags">
${(article.tags||[]).map(tag=>`<span class="tag">${escapeHTML(tag)}</span>`).join("")}
</div>

${renderRelatedArticles(article)}
<div class="share-row">
<button id="copyLink" class="btn primary">${t.copy}</button>
<a href="./" class="btn ghost">${t.latest}</a>
</div>
</div>
</section>
`;


document.title=`${c.title} — AI PLADUOM`;

function setMeta(name, content){
let el=document.querySelector(`meta[name="${name}"]`);
if(!el){
el=document.createElement("meta");
el.setAttribute("name",name);
document.head.appendChild(el);
}
el.setAttribute("content",content);
}

function setProperty(property, content){
let el=document.querySelector(`meta[property="${property}"]`);
if(!el){
el=document.createElement("meta");
el.setAttribute("property",property);
document.head.appendChild(el);
}
el.setAttribute("content",content);
}

setMeta("description",c.text);
setProperty("og:title",c.title);
setProperty("og:description",c.text);
setProperty("og:type","article");
setProperty("og:url",location.href);
setProperty("og:image",new URL(getArticleImage(article),location.href).href);



document.querySelector("#copyLink")?.addEventListener("click",async()=>{
try{
await navigator.clipboard.writeText(location.href);
document.querySelector("#copyLink").textContent=t.copied;
setTimeout(()=>{
document.querySelector("#copyLink").textContent=t.copy;
},1800);
}catch(e){}
});

return true;
}

function setLang(lang){
currentLang=translations[lang]?lang:"en";
const t=getTranslation();

document.documentElement.lang=currentLang;
document.documentElement.dir=currentLang==="ar"?"rtl":"ltr";

document.querySelectorAll("[data-i18n]").forEach(el=>{
if(t[el.dataset.i18n])el.textContent=t[el.dataset.i18n];
});

document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
if(t[el.dataset.i18nPlaceholder])
el.placeholder=t[el.dataset.i18nPlaceholder];
});

localStorage.setItem("aiPLADUOMLang",currentLang);

const queryArticle=new URLSearchParams(location.search).get("article");

const pathParts=location.pathname
.split("/")
.filter(Boolean);

let pathArticle=null;

const articlesIndex=pathParts.indexOf("articles");

if(articlesIndex!==-1 && pathParts[articlesIndex+1]){
pathArticle=decodeURIComponent(pathParts[articlesIndex+1]);
}

const articleId=queryArticle||pathArticle;

if(articleId){
renderArticlePage(articleId);
}else{
renderArticles();
}
}

const savedLang=localStorage.getItem("aiPLADUOMLang");
const browser=(navigator.language||"en").slice(0,2);
const initial=savedLang||(["en","ar","fr","es"].includes(browser)?browser:"en");


async function loadArticles(){
try{
const response=await fetch("./data/articles.json",{cache:"no-store"});
if(!response.ok)throw new Error("HTTP "+response.status);

const data=await response.json();

if(!Array.isArray(data.articles)){
throw new Error("Invalid articles.json structure");
}

articles=data.articles;

setLang(currentLang);
}catch(error){
console.error("AI PLADUOM content engine:",error);

const box=document.querySelector("#articles");
if(box){
box.innerHTML="<p>Content could not be loaded. Please refresh the page.</p>";
}
}
}

loadArticles();

document.querySelector("#langSelect")?.addEventListener("change",e=>{
setLang(e.target.value);
});

document.querySelector("#search")?.addEventListener("input",e=>{
currentFilter=e.target.value;
renderArticles();
});

// Theme persistence is handled by preferences.js.
if(localStorage.getItem("aiPLADUOMTheme")==="dark"){
document.body.classList.add("dark");
}



const year=document.querySelector("#year");
if(year)year.textContent=new Date().getFullYear();

if("serviceWorker" in navigator){
window.addEventListener("load",()=>{
navigator.serviceWorker.register("./sw.js").catch(()=>{});
});
}

const queryArticle=new URLSearchParams(location.search).get("article");

const pathParts=location.pathname
.split("/")
.filter(Boolean);

let pathArticle=null;

const articlesIndex=pathParts.indexOf("articles");

if(articlesIndex!==-1 && pathParts[articlesIndex+1]){
pathArticle=decodeURIComponent(pathParts[articlesIndex+1]);
}

const articleId=queryArticle||pathArticle;

if(articleId){
renderArticlePage(articleId);
}else{
renderArticles();
}
