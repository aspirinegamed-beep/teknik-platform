const translations={
en:{
latest:"Latest",aiTools:"AI Tools",android:"Android",guides:"Guides",
eyebrow:"SMARTER DIGITAL LIFE",
heroTitle:"Find the tools that make digital work easier.",
heroText:"Practical guides, AI tools, Android apps and comparisons — explained simply and built for real-world use.",
explore:"Explore articles",subscribe:"Get updates",latestTitle:"Latest insights",
search:"Search articles...",aiTitle:"AI tools worth knowing",
aiText:"Curated tools, workflows and practical use cases without the hype.",
androidTitle:"Android, simplified",guidesTitle:"Built for action",
guidesText:"Every guide is designed to answer a question and lead to a useful next step.",
newsTitle:"Useful updates. No noise.",
newsText:"Get practical digital tips and useful updates.",
join:"Join",readMore:"Read more →",noResults:"No matching articles found.",
subscribed:"You're subscribed. Welcome to AI Nova!"
},
ar:{
latest:"الأحدث",aiTools:"أدوات الذكاء الاصطناعي",android:"أندرويد",guides:"أدلة",
eyebrow:"حياة رقمية أذكى",
heroTitle:"اكتشف الأدوات التي تجعل العمل الرقمي أسهل.",
heroText:"أدلة عملية وأدوات ذكاء اصطناعي وتطبيقات Android ومقارنات مفهومة.",
explore:"استكشف المقالات",subscribe:"احصل على التحديثات",latestTitle:"أحدث المحتوى",
search:"ابحث في المقالات...",aiTitle:"أدوات AI تستحق المعرفة",
aiText:"أدوات وسير عمل واستخدامات عملية بدون مبالغة.",
androidTitle:"Android بشكل أبسط",guidesTitle:"مصمم للتطبيق",
guidesText:"كل دليل يجيب عن سؤال ويقودك إلى خطوة عملية.",
newsTitle:"تحديثات مفيدة بدون ضجيج",
newsText:"احصل على نصائح رقمية وتحديثات مفيدة.",
join:"اشترك",readMore:"اقرأ المزيد ←",noResults:"لم نجد مقالات مطابقة.",
subscribed:"تم الاشتراك بنجاح. أهلاً بك في AI Nova!"
},
fr:{
latest:"Nouveautés",aiTools:"Outils IA",android:"Android",guides:"Guides",
eyebrow:"UNE VIE NUMÉRIQUE PLUS INTELLIGENTE",
heroTitle:"Trouvez les outils qui simplifient le travail numérique.",
heroText:"Guides pratiques, outils IA, applications Android et comparatifs.",
explore:"Explorer",subscribe:"Recevoir les nouveautés",latestTitle:"Dernières informations",
search:"Rechercher...",aiTitle:"Outils IA à connaître",
aiText:"Des outils et cas d'usage pratiques, sans battage.",
androidTitle:"Android, simplement",guidesTitle:"Pensé pour l'action",
guidesText:"Chaque guide répond à une question et propose une prochaine étape.",
newsTitle:"Des mises à jour utiles.",newsText:"Recevez des conseils numériques utiles.",
join:"S'inscrire",readMore:"Lire la suite →",noResults:"Aucun article correspondant.",
subscribed:"Inscription réussie. Bienvenue sur AI Nova !"
},
es:{
latest:"Últimos",aiTools:"Herramientas IA",android:"Android",guides:"Guías",
eyebrow:"VIDA DIGITAL MÁS INTELIGENTE",
heroTitle:"Encuentra herramientas que facilitan el trabajo digital.",
heroText:"Guías prácticas, herramientas de IA, apps Android y comparativas.",
explore:"Explorar",subscribe:"Recibir novedades",latestTitle:"Últimos contenidos",
search:"Buscar artículos...",aiTitle:"Herramientas IA que debes conocer",
aiText:"Herramientas y casos prácticos sin exageraciones.",
androidTitle:"Android, simplificado",guidesTitle:"Hecho para actuar",
guidesText:"Cada guía responde una pregunta y lleva a un siguiente paso.",
newsTitle:"Actualizaciones útiles.",newsText:"Recibe consejos y actualizaciones digitales.",
join:"Unirse",readMore:"Leer más →",noResults:"No se encontraron artículos.",
subscribed:"Suscripción realizada. ¡Bienvenido a AI Nova!"
}
};

const articles=[
{
tag:"AI",
title:"How to choose an AI tool for a real task",
text:"A practical framework for comparing AI tools by outcome, privacy, limits and cost."
},
{
tag:"ANDROID",
title:"Android productivity setup: a simple starting point",
text:"A clean workflow for files, notes, automation and everyday digital work."
},
{
tag:"GUIDE",
title:"Free digital tools: what to check before signing up",
text:"A checklist for hidden limits, privacy, export options and account requirements."
},
{
tag:"AI",
title:"AI workflows that save time without expensive software",
text:"Simple workflows that can start with free tools and scale later."
},
{
tag:"SECURITY",
title:"Five privacy checks for any new Android app",
text:"Permissions, data collection, updates and account access explained."
},
{
tag:"GUIDE",
title:"How to build a useful online resource from zero",
text:"A practical roadmap from the first page to a sustainable content system."
}
];

let currentLang="en";

function renderArticles(filter=""){
const box=document.querySelector("#articles");
if(!box)return;

const q=filter.trim().toLowerCase();

const results=articles.filter(a=>
(a.title+" "+a.text+" "+a.tag).toLowerCase().includes(q)
);

const t=translations[currentLang];

box.innerHTML=results.length
?results.map((a,i)=>`
<article class="article">
<span class="tag">${a.tag}</span>
<h3>${escapeHTML(a.title)}</h3>
<p>${escapeHTML(a.text)}</p>
<a href="#article-${i}" class="read-article" data-index="${i}" aria-label="${escapeHTML(a.title)}">
${t.readMore}
</a>
</article>`).join("")
:`<p>${t.noResults}</p>`;
}

function escapeHTML(str){
return str.replace(/[&<>"']/g,m=>({
"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[m]));
}

function setLang(lang){
currentLang=translations[lang]?lang:"en";
const t=translations[currentLang];

document.documentElement.lang=currentLang;
document.documentElement.dir=currentLang==="ar"?"rtl":"ltr";

document.querySelectorAll("[data-i18n]").forEach(el=>{
if(t[el.dataset.i18n])el.textContent=t[el.dataset.i18n];
});

document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
if(t[el.dataset.i18nPlaceholder])
el.placeholder=t[el.dataset.i18nPlaceholder];
});

const select=document.querySelector("#langSelect");
if(select)select.value=currentLang;

localStorage.setItem("aiNovaLang",currentLang);
renderArticles(document.querySelector("#search")?.value||"");
}

function openArticle(index){
const article=articles[index];
if(!article)return;

const overlay=document.createElement("div");
overlay.className="article-modal";
overlay.innerHTML=`
<div class="modal-backdrop"></div>
<div class="modal-content" role="dialog" aria-modal="true">
<button class="modal-close" aria-label="Close">×</button>
<span class="tag">${article.tag}</span>
<h2>${escapeHTML(article.title)}</h2>
<p>${escapeHTML(article.text)}</p>
<p class="modal-extra">
AI Nova provides practical digital information designed to help you understand
technology and make better decisions.
</p>
</div>`;

document.body.appendChild(overlay);

requestAnimationFrame(()=>overlay.classList.add("visible"));

function close(){
overlay.classList.remove("visible");
setTimeout(()=>overlay.remove(),180);
}

overlay.querySelector(".modal-close").onclick=close;
overlay.querySelector(".modal-backdrop").onclick=close;

document.addEventListener("keydown",function esc(e){
if(e.key==="Escape"){
close();
document.removeEventListener("keydown",esc);
}
});
}

document.addEventListener("click",e=>{
const link=e.target.closest(".read-article");
if(link){
e.preventDefault();
openArticle(Number(link.dataset.index));
}
});

const savedLang=localStorage.getItem("aiNovaLang");
const browser=(navigator.language||"en").slice(0,2);
const initial=savedLang||(["en","ar","fr","es"].includes(browser)?browser:"en");

setLang(initial);

document.querySelector("#langSelect")?.addEventListener("change",e=>{
setLang(e.target.value);
});

document.querySelector("#search")?.addEventListener("input",e=>{
renderArticles(e.target.value);
});

const themeBtn=document.querySelector("#themeBtn");

themeBtn?.addEventListener("click",()=>{
const dark=document.body.classList.toggle("dark");
localStorage.setItem("aiNovaTheme",dark?"dark":"light");
themeBtn.setAttribute("aria-pressed",dark?"true":"false");
});

if(localStorage.getItem("aiNovaTheme")==="dark"){
document.body.classList.add("dark");
themeBtn?.setAttribute("aria-pressed","true");
}

const year=document.querySelector("#year");
if(year)year.textContent=new Date().getFullYear();

document.querySelector(".newsletter form")?.addEventListener("submit",e=>{
e.preventDefault();

const input=e.currentTarget.querySelector("input");
if(!input?.value)return;

const t=translations[currentLang];

e.currentTarget.innerHTML=`
<p class="subscribe-success">${t.subscribed}</p>`;

});

renderArticles();
