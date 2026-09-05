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
subscribed:"You're subscribed. Welcome to AI Nova!",
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
subscribed:"تم الاشتراك بنجاح. أهلاً بك في AI Nova!",
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
subscribed:"Inscription réussie. Bienvenue sur AI Nova !",
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
subscribed:"Suscripción realizada. ¡Bienvenido a AI Nova!",
copy:"Copiar enlace",
copied:"¡Enlace copiado!"
}
};

const articles=[
{
id:"choose-ai-tool",
tag:"AI",
title:"How to choose an AI tool for a real task",
text:"A practical framework for comparing AI tools by outcome, privacy, limits and cost.",
body:"Choosing an AI tool should start with the task, not the hype. Define the result you need, compare the available tools, check privacy policies and understand usage limits before committing."
},
{
id:"android-productivity",
tag:"ANDROID",
title:"Android productivity setup: a simple starting point",
text:"A clean workflow for files, notes, automation and everyday digital work.",
body:"A productive Android setup does not require dozens of applications. Start with reliable file management, notes, backups and a small number of automation tools that solve real problems."
},
{
id:"free-digital-tools",
tag:"GUIDE",
title:"Free digital tools: what to check before signing up",
text:"A checklist for hidden limits, privacy, export options and account requirements.",
body:"Free does not always mean unlimited. Before creating an account, check usage limits, privacy policies, export options, advertisements and whether important features require payment."
},
{
id:"ai-free-workflows",
tag:"AI",
title:"AI workflows that save time without expensive software",
text:"Simple workflows that can start with free tools and scale later.",
body:"The best AI workflow is often a simple one. Combine a clear prompt, structured input and a repeatable process. Start with free tools and upgrade only when a real limitation appears."
},
{
id:"android-privacy",
tag:"SECURITY",
title:"Five privacy checks for any new Android app",
text:"Permissions, data collection, updates and account access explained.",
body:"Before installing a new Android application, examine its requested permissions, developer information, update history, privacy policy and account requirements."
},
{
id:"build-resource",
tag:"GUIDE",
title:"How to build a useful online resource from zero",
text:"A practical roadmap from the first page to a sustainable content system.",
body:"Start small. Build a clear homepage, publish useful content consistently, organize it into categories and measure which topics actually help visitors."
}
];

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

function renderArticles(){
const box=document.querySelector("#articles");
if(!box)return;

const q=currentFilter.trim().toLowerCase();

const results=articles.filter(a=>{
const matchesSearch=(a.title+" "+a.text+" "+a.tag).toLowerCase().includes(q);
return matchesSearch;
});

const t=getTranslation();

box.innerHTML=results.length
?results.map(a=>`
<article class="article">
<span class="tag">${escapeHTML(a.tag)}</span>
<h3>${escapeHTML(a.title)}</h3>
<p>${escapeHTML(a.text)}</p>
<a href="?article=${encodeURIComponent(a.id)}" class="read-article" data-id="${escapeHTML(a.id)}">
${t.readMore}
</a>
</article>`).join("")
:`<p>${t.noResults}</p>`;
}

function renderArticlePage(id){
const article=articles.find(a=>a.id===id);
if(!article)return false;

const t=getTranslation();
const root=document.querySelector("main");

if(!root)return false;

root.innerHTML=`
<section class="article-page section">
<div class="article-page-inner">
<a href="./" class="back-link">← ${t.latestTitle}</a>
<span class="tag">${escapeHTML(article.tag)}</span>
<h1>${escapeHTML(article.title)}</h1>
<p class="article-lead">${escapeHTML(article.text)}</p>
<div class="article-body">
<p>${escapeHTML(article.body)}</p>
<h2>Why it matters</h2>
<p>Good digital decisions come from understanding the problem, comparing realistic options and choosing tools that fit your needs.</p>
<h2>Practical takeaway</h2>
<p>Start with the simplest solution. Test it, measure the result and improve the workflow only when necessary.</p>
</div>
<div class="share-row">
<button id="copyLink" class="btn primary">${t.copy}</button>
<a href="./" class="btn ghost">${t.latest}</a>
</div>
</div>
</section>
`;

document.title=`${article.title} — AI Nova`;

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

localStorage.setItem("aiNovaLang",currentLang);

const articleId=new URLSearchParams(location.search).get("article");

if(articleId){
renderArticlePage(articleId);
}else{
renderArticles();
}
}

const savedLang=localStorage.getItem("aiNovaLang");
const browser=(navigator.language||"en").slice(0,2);
const initial=savedLang||(["en","ar","fr","es"].includes(browser)?browser:"en");

setLang(initial);

document.querySelector("#langSelect")?.addEventListener("change",e=>{
setLang(e.target.value);
});

document.querySelector("#search")?.addEventListener("input",e=>{
currentFilter=e.target.value;
renderArticles();
});

document.querySelector("#themeBtn")?.addEventListener("click",()=>{
const dark=document.body.classList.toggle("dark");
localStorage.setItem("aiNovaTheme",dark?"dark":"light");
});

if(localStorage.getItem("aiNovaTheme")==="dark"){
document.body.classList.add("dark");
}

document.querySelector(".newsletter form")?.addEventListener("submit",e=>{
e.preventDefault();

const input=e.currentTarget.querySelector("input");

if(!input?.value)return;

const t=getTranslation();

e.currentTarget.innerHTML=
`<p class="subscribe-success">${t.subscribed}</p>`;
});

const year=document.querySelector("#year");
if(year)year.textContent=new Date().getFullYear();

if("serviceWorker" in navigator){
window.addEventListener("load",()=>{
navigator.serviceWorker.register("./sw.js").catch(()=>{});
});
}

const articleId=new URLSearchParams(location.search).get("article");

if(articleId){
renderArticlePage(articleId);
}else{
renderArticles();
}
