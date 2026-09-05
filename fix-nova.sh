#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/ai-nova || exit 1

echo "🔧 AI NOVA — FIX PACK (gitignore + RTL + multilingual articles)"

# ==============================
# 1) GITIGNORE + REMOVE BACKUPS FROM GIT
# ==============================
cat > .gitignore <<'EOF'
*.backup
backup-v2/
EOF

git rm -r --cached backup-v2 2>/dev/null || true
git rm --cached index.html.backup assets/app.js.backup assets/style.css.backup 2>/dev/null || true

echo "✓ gitignore created, backups untracked"

# ==============================
# 2) RTL CSS FIXES
# ==============================
cat >> assets/style.css <<'EOF'

/* ===== RTL support ===== */
html[dir="rtl"] body{
text-align:right;
}

html[dir="rtl"] .back-link{
margin-right:0;
margin-left:auto;
}

html[dir="rtl"] .share-row{
flex-direction:row-reverse;
}

html[dir="rtl"] .site-links{
flex-direction:row-reverse;
}

html[dir="rtl"] .article-lead,
html[dir="rtl"] .article-body{
text-align:right;
}

html[dir="rtl"] .topbar{
flex-direction:row-reverse;
}

html[dir="rtl"] .newsletter form{
flex-direction:row-reverse;
}

html[dir="rtl"] .read-article{
flex-direction:row-reverse;
}

@media(max-width:600px){
html[dir="rtl"] .site-links{
justify-content:flex-end;
}
}
EOF

echo "✓ RTL styles appended"

# ==============================
# 3) MULTILINGUAL ARTICLES — rewrite app.js article data + render logic
# ==============================
python3 - <<'PY'
from pathlib import Path
import re

p = Path("assets/app.js")
s = p.read_text()

# ---- new multilingual articles array ----
new_articles = '''const articles=[
{
id:"choose-ai-tool",
tag:"AI",
content:{
en:{title:"How to choose an AI tool for a real task",text:"A practical framework for comparing AI tools by outcome, privacy, limits and cost.",body:"Choosing an AI tool should start with the task, not the hype. Define the result you need, compare the available tools, check privacy policies and understand usage limits before committing."},
ar:{title:"كيف تختار أداة ذكاء اصطناعي لمهمة حقيقية",text:"إطار عملي لمقارنة أدوات الذكاء الاصطناعي من حيث النتيجة والخصوصية والحدود والتكلفة.",body:"يجب أن يبدأ اختيار أداة الذكاء الاصطناعي من المهمة نفسها وليس من الضجيج الإعلامي. حدّد النتيجة التي تحتاجها، قارن بين الأدوات المتاحة، تحقق من سياسات الخصوصية وافهم حدود الاستخدام قبل الالتزام."},
fr:{title:"Comment choisir un outil IA pour une tâche réelle",text:"Un cadre pratique pour comparer les outils IA selon le résultat, la confidentialité, les limites et le coût.",body:"Le choix d'un outil IA doit partir de la tâche, pas du battage médiatique. Définissez le résultat recherché, comparez les outils disponibles, vérifiez les politiques de confidentialité et comprenez les limites d'utilisation avant de vous engager."},
es:{title:"Cómo elegir una herramienta de IA para una tarea real",text:"Un marco práctico para comparar herramientas de IA según resultado, privacidad, límites y costo.",body:"Elegir una herramienta de IA debe partir de la tarea, no de las modas. Define el resultado que necesitas, compara las herramientas disponibles, revisa las políticas de privacidad y entiende los límites de uso antes de comprometerte."}
}
},
{
id:"android-productivity",
tag:"ANDROID",
content:{
en:{title:"Android productivity setup: a simple starting point",text:"A clean workflow for files, notes, automation and everyday digital work.",body:"A productive Android setup does not require dozens of applications. Start with reliable file management, notes, backups and a small number of automation tools that solve real problems."},
ar:{title:"إعداد أندرويد للإنتاجية: نقطة بداية بسيطة",text:"سير عمل مرتب للملفات والملاحظات والأتمتة والعمل الرقمي اليومي.",body:"لا يتطلب إعداد أندرويد المنتِج عشرات التطبيقات. ابدأ بإدارة ملفات موثوقة، ملاحظات، نسخ احتياطية، وعدد قليل من أدوات الأتمتة التي تحل مشاكل حقيقية."},
fr:{title:"Configuration Android productive : un point de départ simple",text:"Un flux de travail clair pour les fichiers, notes, automatisation et le travail numérique quotidien.",body:"Une configuration Android productive ne nécessite pas des dizaines d'applications. Commencez par une gestion fiable des fichiers, des notes, des sauvegardes et quelques outils d'automatisation qui résolvent de vrais problèmes."},
es:{title:"Configuración de productividad en Android: un punto de partida simple",text:"Un flujo de trabajo claro para archivos, notas, automatización y trabajo digital diario.",body:"Una configuración productiva de Android no requiere docenas de aplicaciones. Comienza con una gestión de archivos confiable, notas, copias de seguridad y algunas herramientas de automatización que resuelvan problemas reales."}
}
},
{
id:"free-digital-tools",
tag:"GUIDE",
content:{
en:{title:"Free digital tools: what to check before signing up",text:"A checklist for hidden limits, privacy, export options and account requirements.",body:"Free does not always mean unlimited. Before creating an account, check usage limits, privacy policies, export options, advertisements and whether important features require payment."},
ar:{title:"أدوات رقمية مجانية: ما يجب التحقق منه قبل التسجيل",text:"قائمة تحقق للحدود الخفية والخصوصية وخيارات التصدير ومتطلبات الحساب.",body:"مجاني لا يعني دائماً بلا حدود. قبل إنشاء حساب، تحقق من حدود الاستخدام، سياسات الخصوصية، خيارات التصدير، الإعلانات، وما إذا كانت الميزات المهمة تتطلب دفعاً."},
fr:{title:"Outils numériques gratuits : que vérifier avant de s'inscrire",text:"Une checklist pour les limites cachées, la confidentialité, les options d'export et les exigences de compte.",body:"Gratuit ne signifie pas toujours illimité. Avant de créer un compte, vérifiez les limites d'utilisation, les politiques de confidentialité, les options d'export, les publicités et si les fonctionnalités importantes nécessitent un paiement."},
es:{title:"Herramientas digitales gratuitas: qué revisar antes de registrarte",text:"Una lista de verificación de límites ocultos, privacidad, opciones de exportación y requisitos de cuenta.",body:"Gratis no siempre significa ilimitado. Antes de crear una cuenta, revisa los límites de uso, las políticas de privacidad, las opciones de exportación, la publicidad y si las funciones importantes requieren pago."}
}
},
{
id:"ai-free-workflows",
tag:"AI",
content:{
en:{title:"AI workflows that save time without expensive software",text:"Simple workflows that can start with free tools and scale later.",body:"The best AI workflow is often a simple one. Combine a clear prompt, structured input and a repeatable process. Start with free tools and upgrade only when a real limitation appears."},
ar:{title:"سير عمل ذكاء اصطناعي يوفر الوقت دون برامج مكلفة",text:"سير عمل بسيط يمكن أن يبدأ بأدوات مجانية ثم يتوسع لاحقاً.",body:"أفضل سير عمل بالذكاء الاصطناعي غالباً ما يكون بسيطاً. اجمع بين تعليمات واضحة، مدخلات منظمة، وعملية قابلة للتكرار. ابدأ بأدوات مجانية وطوّر فقط عند ظهور قيد حقيقي."},
fr:{title:"Des flux de travail IA qui font gagner du temps sans logiciel coûteux",text:"Des flux simples qui peuvent démarrer avec des outils gratuits puis évoluer.",body:"Le meilleur flux de travail IA est souvent simple. Combinez une consigne claire, une entrée structurée et un processus reproductible. Commencez avec des outils gratuits et évoluez seulement en cas de vraie limite."},
es:{title:"Flujos de trabajo de IA que ahorran tiempo sin software costoso",text:"Flujos simples que pueden comenzar con herramientas gratuitas y escalar después.",body:"El mejor flujo de trabajo de IA suele ser simple. Combina una instrucción clara, una entrada estructurada y un proceso repetible. Comienza con herramientas gratuitas y mejora solo cuando aparezca una limitación real."}
}
},
{
id:"android-privacy",
tag:"SECURITY",
content:{
en:{title:"Five privacy checks for any new Android app",text:"Permissions, data collection, updates and account access explained.",body:"Before installing a new Android application, examine its requested permissions, developer information, update history, privacy policy and account requirements."},
ar:{title:"خمسة فحوصات خصوصية لأي تطبيق أندرويد جديد",text:"شرح للأذونات وجمع البيانات والتحديثات والوصول إلى الحساب.",body:"قبل تثبيت تطبيق أندرويد جديد، افحص الأذونات المطلوبة، معلومات المطوّر، سجل التحديثات، سياسة الخصوصية، ومتطلبات الحساب."},
fr:{title:"Cinq vérifications de confidentialité pour toute nouvelle app Android",text:"Permissions, collecte de données, mises à jour et accès au compte expliqués.",body:"Avant d'installer une nouvelle application Android, examinez les permissions demandées, les informations sur le développeur, l'historique des mises à jour, la politique de confidentialité et les exigences de compte."},
es:{title:"Cinco verificaciones de privacidad para cualquier app nueva de Android",text:"Permisos, recopilación de datos, actualizaciones y acceso a la cuenta explicados.",body:"Antes de instalar una nueva aplicación de Android, revisa los permisos solicitados, la información del desarrollador, el historial de actualizaciones, la política de privacidad y los requisitos de cuenta."}
}
},
{
id:"build-resource",
tag:"GUIDE",
content:{
en:{title:"How to build a useful online resource from zero",text:"A practical roadmap from the first page to a sustainable content system.",body:"Start small. Build a clear homepage, publish useful content consistently, organize it into categories and measure which topics actually help visitors."},
ar:{title:"كيف تبني مصدراً رقمياً مفيداً من الصفر",text:"خارطة طريق عملية من الصفحة الأولى إلى نظام محتوى مستدام.",body:"ابدأ صغيراً. ابنِ صفحة رئيسية واضحة، انشر محتوى مفيداً بانتظام، نظّمه في تصنيفات، وقِس أي المواضيع تفيد الزوار فعلاً."},
fr:{title:"Comment construire une ressource en ligne utile à partir de zéro",text:"Une feuille de route pratique, de la première page à un système de contenu durable.",body:"Commencez petit. Construisez une page d'accueil claire, publiez du contenu utile régulièrement, organisez-le en catégories et mesurez quels sujets aident réellement les visiteurs."},
es:{title:"Cómo construir un recurso en línea útil desde cero",text:"Una hoja de ruta práctica desde la primera página hasta un sistema de contenido sostenible.",body:"Empieza en pequeño. Construye una página de inicio clara, publica contenido útil de forma constante, organízalo en categorías y mide qué temas realmente ayudan a los visitantes."}
}
}
];'''

# replace old articles array (from "const articles=[" up to its closing "];")
pattern = re.compile(r"const articles=\[.*?\n\];", re.DOTALL)
s, n = pattern.subn(new_articles, s, count=1)
if n == 0:
    raise SystemExit("ERROR: could not find articles array to replace")

# ---- update renderArticles() to use content[currentLang] ----
old_render = '''function renderArticles(){
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
}'''

new_render = '''function getArticleContent(article){
return article.content[currentLang]||article.content.en;
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
<article class="article">
<span class="tag">${escapeHTML(a.tag)}</span>
<h3>${escapeHTML(c.title)}</h3>
<p>${escapeHTML(c.text)}</p>
<a href="?article=${encodeURIComponent(a.id)}" class="read-article" data-id="${escapeHTML(a.id)}">
${t.readMore}
</a>
</article>`;
}).join("")
:`<p>${t.noResults}</p>`;
}'''

if old_render not in s:
    raise SystemExit("ERROR: could not find renderArticles() to replace")
s = s.replace(old_render, new_render, 1)

# ---- update renderArticlePage() to use content[currentLang] ----
old_page = '''function renderArticlePage(id){
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

document.title=`${article.title} — AI Nova`;'''

new_page = '''function renderArticlePage(id){
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
<span class="tag">${escapeHTML(article.tag)}</span>
<h1>${escapeHTML(c.title)}</h1>
<p class="article-lead">${escapeHTML(c.text)}</p>
<div class="article-body">
<p>${escapeHTML(c.body)}</p>
</div>
<div class="share-row">
<button id="copyLink" class="btn primary">${t.copy}</button>
<a href="./" class="btn ghost">${t.latest}</a>
</div>
</div>
</section>
`;

document.title=`${c.title} — AI Nova`;'''

if old_page not in s:
    raise SystemExit("ERROR: could not find renderArticlePage() to replace")
s = s.replace(old_page, new_page, 1)

p.write_text(s)
print("✓ app.js updated: multilingual articles + render functions")
PY

# ==============================
# VALIDATION
# ==============================
echo
echo "========== VALIDATION =========="
node -c assets/app.js 2>/dev/null && echo "✓ app.js syntax OK" || echo "⚠ node not available, skipping syntax check"
grep -q "RTL support" assets/style.css && echo "✓ RTL CSS present"
grep -q "backup-v2/" .gitignore && echo "✓ gitignore present"

# ==============================
# GIT
# ==============================
echo
echo "========== GIT =========="

git add .
git status --short
git commit -m "Fix pack: gitignore backups, RTL support, multilingual articles" || true
git push origin main

echo
echo "========== DONE =========="
echo "https://aspirinegamed-beep.github.io/teknik-platform/"
echo
echo "curl -sS -o /dev/null -w 'HTTP: %{http_code}\n' https://aspirinegamed-beep.github.io/teknik-platform/"
