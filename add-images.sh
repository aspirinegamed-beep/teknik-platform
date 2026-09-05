#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/ai-nova || exit 1

echo "🖼️  AI NOVA — ADD ARTICLE IMAGES"

# ==============================
# 1) CREATE 4 ORIGINAL SVG ILLUSTRATIONS (one per category)
# ==============================

cat > assets/img-ai.svg <<'EOF'
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="bgAI" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#151b2c"/><stop offset="1" stop-color="#1f2740"/>
</linearGradient></defs>
<rect width="400" height="240" fill="url(#bgAI)"/>
<g stroke="#8b5cf6" stroke-width="1.5" opacity="0.5">
<line x1="80" y1="60" x2="150" y2="100"/><line x1="80" y1="180" x2="150" y2="140"/>
<line x1="320" y1="60" x2="250" y2="100"/><line x1="320" y1="180" x2="250" y2="140"/>
<line x1="150" y1="100" x2="250" y2="100"/><line x1="150" y1="140" x2="250" y2="140"/>
<line x1="150" y1="100" x2="150" y2="140"/><line x1="250" y1="100" x2="250" y2="140"/>
</g>
<circle cx="80" cy="60" r="6" fill="#22d3ee"/><circle cx="80" cy="180" r="6" fill="#22d3ee"/>
<circle cx="320" cy="60" r="6" fill="#22d3ee"/><circle cx="320" cy="180" r="6" fill="#22d3ee"/>
<circle cx="150" cy="100" r="7" fill="#8b5cf6"/><circle cx="150" cy="140" r="7" fill="#8b5cf6"/>
<circle cx="250" cy="100" r="7" fill="#8b5cf6"/><circle cx="250" cy="140" r="7" fill="#8b5cf6"/>
<rect x="175" y="95" width="50" height="50" rx="10" fill="#111827" stroke="#22d3ee" stroke-width="2"/>
<circle cx="200" cy="120" r="14" fill="none" stroke="#8b5cf6" stroke-width="3"/>
<circle cx="200" cy="120" r="4" fill="#22d3ee"/>
</svg>
EOF

cat > assets/img-android.svg <<'EOF'
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="bgAND" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#151b2c"/><stop offset="1" stop-color="#1f2740"/>
</linearGradient></defs>
<rect width="400" height="240" fill="url(#bgAND)"/>
<rect x="160" y="35" width="80" height="170" rx="14" fill="#111827" stroke="#22d3ee" stroke-width="2.5"/>
<rect x="170" y="52" width="60" height="120" rx="3" fill="#1a2338"/>
<circle cx="200" cy="188" r="6" fill="#8b5cf6"/>
<g fill="#8b5cf6" opacity="0.9">
<rect x="177" y="60" width="18" height="18" rx="4"/><rect x="203" y="60" width="18" height="18" rx="4"/>
<rect x="177" y="86" width="18" height="18" rx="4"/>
</g>
<g fill="#22d3ee" opacity="0.9">
<rect x="203" y="86" width="18" height="18" rx="4"/>
<rect x="177" y="112" width="18" height="18" rx="4"/><rect x="203" y="112" width="18" height="18" rx="4"/>
</g>
<circle cx="90" cy="90" r="30" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0.4"/>
<circle cx="310" cy="150" r="22" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.4"/>
</svg>
EOF

cat > assets/img-guide.svg <<'EOF'
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="bgGD" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#151b2c"/><stop offset="1" stop-color="#1f2740"/>
</linearGradient></defs>
<rect width="400" height="240" fill="url(#bgGD)"/>
<rect x="135" y="40" width="130" height="160" rx="10" fill="#111827" stroke="#8b5cf6" stroke-width="2.5"/>
<line x1="155" y1="70" x2="245" y2="70" stroke="#22d3ee" stroke-width="4" stroke-linecap="round"/>
<g fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<circle cx="160" cy="100" r="8"/><path d="M156 100l3 3l6 -7"/>
</g>
<line x1="180" y1="100" x2="245" y2="100" stroke="#4b5568" stroke-width="4" stroke-linecap="round"/>
<g fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<circle cx="160" cy="130" r="8"/><path d="M156 130l3 3l6 -7"/>
</g>
<line x1="180" y1="130" x2="245" y2="130" stroke="#4b5568" stroke-width="4" stroke-linecap="round"/>
<circle cx="160" cy="160" r="8" fill="none" stroke="#4b5568" stroke-width="3"/>
<line x1="180" y1="160" x2="230" y2="160" stroke="#4b5568" stroke-width="4" stroke-linecap="round"/>
<circle cx="90" cy="70" r="20" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.4"/>
<circle cx="315" cy="170" r="26" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0.4"/>
</svg>
EOF

cat > assets/img-security.svg <<'EOF'
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="bgSEC" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#151b2c"/><stop offset="1" stop-color="#1f2740"/>
</linearGradient></defs>
<rect width="400" height="240" fill="url(#bgSEC)"/>
<path d="M200 35 L255 55 L255 120 C255 160 230 185 200 200 C170 185 145 160 145 120 L145 55 Z"
fill="#111827" stroke="#8b5cf6" stroke-width="3"/>
<rect x="182" y="110" width="36" height="28" rx="4" fill="#1a2338" stroke="#22d3ee" stroke-width="2.5"/>
<path d="M190 110 v-12 a10 10 0 0 1 20 0 v12" fill="none" stroke="#22d3ee" stroke-width="2.5"/>
<circle cx="200" cy="123" r="4" fill="#22d3ee"/>
<circle cx="95" cy="80" r="22" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.4"/>
<circle cx="305" cy="160" r="28" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0.4"/>
</svg>
EOF

echo "✓ 4 رسومات SVG أصلية تم إنشاؤها"

# ==============================
# 2) PATCH app.js — add image mapping + inject into card and article page
# ==============================
python3 - <<'PY'
from pathlib import Path

p = Path("assets/app.js")
s = p.read_text()

old_helper = '''function getArticleContent(article){
return article.content[currentLang]||article.content.en;
}'''

new_helper = '''function getArticleContent(article){
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
}'''

if old_helper not in s:
    raise SystemExit("ERROR: getArticleContent() not found in app.js")
s = s.replace(old_helper, new_helper, 1)

old_card = '''return `
<article class="article">
<span class="tag">${escapeHTML(a.tag)}</span>
<h3>${escapeHTML(c.title)}</h3>
<p>${escapeHTML(c.text)}</p>
<a href="?article=${encodeURIComponent(a.id)}" class="read-article" data-id="${escapeHTML(a.id)}">
${t.readMore}
</a>
</article>`;'''

new_card = '''return `
<article class="article">
<img class="article-thumb" src="${getArticleImage(a)}" alt="${escapeHTML(a.tag)}" loading="lazy">
<span class="tag">${escapeHTML(a.tag)}</span>
<h3>${escapeHTML(c.title)}</h3>
<p>${escapeHTML(c.text)}</p>
<a href="?article=${encodeURIComponent(a.id)}" class="read-article" data-id="${escapeHTML(a.id)}">
${t.readMore}
</a>
</article>`;'''

if old_card not in s:
    raise SystemExit("ERROR: article card template not found in app.js")
s = s.replace(old_card, new_card, 1)

old_page = '''root.innerHTML=`
<section class="article-page section">
<div class="article-page-inner">
<a href="./" class="back-link">← ${t.latestTitle}</a>
<span class="tag">${escapeHTML(article.tag)}</span>
<h1>${escapeHTML(c.title)}</h1>'''

new_page = '''root.innerHTML=`
<section class="article-page section">
<div class="article-page-inner">
<a href="./" class="back-link">← ${t.latestTitle}</a>
<img class="article-hero" src="${getArticleImage(article)}" alt="${escapeHTML(article.tag)}" loading="lazy">
<span class="tag">${escapeHTML(article.tag)}</span>
<h1>${escapeHTML(c.title)}</h1>'''

if old_page not in s:
    raise SystemExit("ERROR: article page template not found in app.js")
s = s.replace(old_page, new_page, 1)

p.write_text(s)
print("✓ app.js تم تحديثه بربط الصور بالمقالات")
PY

# ==============================
# 3) ADD CSS FOR IMAGES
# ==============================
cat >> assets/style.css <<'EOF'

/* ===== Article images ===== */
.article{
overflow:hidden;
}

.article-thumb{
width:100%;
height:160px;
object-fit:cover;
display:block;
border-radius:10px 10px 0 0;
margin-bottom:14px;
}

.article-hero{
width:100%;
max-height:280px;
object-fit:cover;
border-radius:14px;
margin:20px 0;
}

@media(max-width:600px){
.article-thumb{height:130px;}
.article-hero{max-height:200px;}
}
EOF

echo "✓ تنسيقات CSS للصور تم إضافتها"

# ==============================
# 4) CACHE THE NEW IMAGES IN SERVICE WORKER (if sw.js exists)
# ==============================
if [ -f sw.js ]; then
python3 - <<'PY'
from pathlib import Path
p = Path("sw.js")
s = p.read_text()
old = '"./assets/icon.svg",'
new = '"./assets/icon.svg",\n"./assets/img-ai.svg",\n"./assets/img-android.svg",\n"./assets/img-guide.svg",\n"./assets/img-security.svg",'
if old in s and "img-ai.svg" not in s:
    s = s.replace(old, new, 1)
    p.write_text(s)
    print("✓ sw.js تم تحديثه ليخزّن الصور الجديدة")
else:
    print("ℹ sw.js لم يتغيّر (إما غير موجود النمط أو الصور مضافة مسبقاً)")
PY
fi

# ==============================
# VALIDATION
# ==============================
echo
echo "========== VALIDATION =========="
node -c assets/app.js 2>/dev/null && echo "✓ app.js صياغة صحيحة" || echo "⚠ خطأ في صياغة app.js — تحقق يدوياً"
for f in img-ai img-android img-guide img-security; do
  test -f "assets/${f}.svg" && echo "✓ assets/${f}.svg موجود"
done

# ==============================
# GIT
# ==============================
echo
echo "========== GIT =========="
git add .
git status --short
git commit -m "Add original SVG illustrations for every article category" || true
git push origin main

echo
echo "========== DONE =========="
echo "https://aspirinegamed-beep.github.io/teknik-platform/"
echo
echo "curl -sS -o /dev/null -w 'HTTP: %{http_code}\n' https://aspirinegamed-beep.github.io/teknik-platform/"
