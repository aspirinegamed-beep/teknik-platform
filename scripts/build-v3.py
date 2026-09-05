import re
import json
import html
from pathlib import Path
from datetime import date

ROOT = Path(".")
APP = ROOT / "assets" / "app.js"
BASE = "https://aspirinegamed-beep.github.io/teknik-platform"

# ---------- Backup ----------
backup = ROOT / "backup-v3"
backup.mkdir(exist_ok=True)

for src in [
    ROOT / "index.html",
    APP,
    ROOT / "assets" / "style.css",
    ROOT / "manifest.webmanifest",
    ROOT / "sw.js",
    ROOT / "sitemap.xml",
]:
    if src.exists():
        dst = backup / src.name
        dst.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")

# ---------- Read JS ----------
source = APP.read_text(encoding="utf-8")

# Repair literal newlines accidentally placed inside JS double-quoted strings.
def repair_js_strings(text):
    out = []
    in_string = False
    escaped = False

    for ch in text:
        if in_string:
            if escaped:
                out.append(ch)
                escaped = False
                continue

            if ch == "\\":
                out.append(ch)
                escaped = True
                continue

            if ch == '"':
                out.append(ch)
                in_string = False
                continue

            if ch == "\n":
                out.append("\\n")
                continue

            if ch == "\r":
                continue

            out.append(ch)
        else:
            out.append(ch)
            if ch == '"':
                in_string = True

    return "".join(out)

source = repair_js_strings(source)

# Convert homepage article links to real static URLs.
source = source.replace(
    'href="?article=${encodeURIComponent(a.id)}"',
    'href="articles/${encodeURIComponent(a.id)}/"'
)

APP.write_text(source, encoding="utf-8")

# ---------- Extract articles ----------
start = source.find("const articles=[")
end = source.find("];", start)

if start == -1 or end == -1:
    raise SystemExit("ERROR: Could not locate articles array.")

blob = source[start:end]

id_matches = list(re.finditer(r'\bid:"([^"]+)",\s*tag:"([^"]+)",\s*content:\{', blob))

articles = []

for i, m in enumerate(id_matches):
    aid = m.group(1)
    tag = m.group(2)
    chunk_start = m.end()
    chunk_end = id_matches[i + 1].start() if i + 1 < len(id_matches) else len(blob)
    chunk = blob[chunk_start:chunk_end]

    langs = {}

    pattern = re.compile(
        r'(en|ar|fr|es):\{'
        r'title:"((?:\\.|[^"\\])*)",'
        r'text:"((?:\\.|[^"\\])*)",'
        r'body:"((?:\\.|[^"\\])*)"'
        r'\}',
        re.S
    )

    for lm in pattern.finditer(chunk):
        lang = lm.group(1)

        def decode_js_string(value):
            try:
                return json.loads('"' + value + '"')
            except Exception:
                return value.replace("\\n", "\n").replace('\\"', '"')

        langs[lang] = {
            "title": decode_js_string(lm.group(2)),
            "text": decode_js_string(lm.group(3)),
            "body": decode_js_string(lm.group(4)),
        }

    if "en" not in langs:
        continue

    articles.append({
        "id": aid,
        "tag": tag,
        "content": langs
    })

if not articles:
    raise SystemExit("ERROR: No articles extracted.")

print(f"Extracted {len(articles)} articles.")

# ---------- Helpers ----------
def esc(value):
    return html.escape(str(value), quote=True)

def paragraphs(text):
    parts = re.split(r"\n\s*\n", text.strip())
    return "\n".join(
        f"<p>{esc(p).replace(chr(10), '<br>')}</p>"
        for p in parts if p.strip()
    )

def article_image(tag):
    return {
        "AI": "img-ai.svg",
        "ANDROID": "img-android.svg",
        "GUIDE": "img-guide.svg",
        "SECURITY": "img-security.svg"
    }.get(tag, "img-guide.svg")

lang_names = {
    "en": "English",
    "ar": "العربية",
    "fr": "Français",
    "es": "Español"
}

# ---------- Article pages ----------
for article in articles:
    slug = article["id"]
    tag = article["tag"]
    image = article_image(tag)

    article_dir = ROOT / "articles" / slug
    article_dir.mkdir(parents=True, exist_ok=True)

    for lang, content in article["content"].items():
        if lang not in lang_names:
            continue

        if lang == "en":
            page_dir = article_dir
            rel_root = "../.."
            url = f"{BASE}/articles/{slug}/"
        else:
            page_dir = article_dir / lang
            page_dir.mkdir(parents=True, exist_ok=True)
            rel_root = "../../.."
            url = f"{BASE}/articles/{slug}/{lang}/"

        title = content["title"]
        description = content["text"]

        alternate_links = []

        for alt in ["en", "ar", "fr", "es"]:
            if alt not in article["content"]:
                continue

            if alt == "en":
                alt_url = f"{BASE}/articles/{slug}/"
            else:
                alt_url = f"{BASE}/articles/{slug}/{alt}/"

            alternate_links.append(
                f'<link rel="alternate" hreflang="{alt}" href="{alt_url}">'
            )

        alternate_links.append(
            f'<link rel="alternate" hreflang="x-default" href="{BASE}/articles/{slug}/">'
        )

        jsonld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "url": url,
            "image": f"{BASE}/assets/{image}",
            "publisher": {
                "@type": "Organization",
                "name": "AI Nova",
                "url": BASE
            }
        }

        body = paragraphs(content["body"])

        language_switch = []
        for alt in ["en", "ar", "fr", "es"]:
            if alt not in article["content"]:
                continue

            if alt == "en":
                href = f"{rel_root}/articles/{slug}/"
            else:
                href = f"{rel_root}/articles/{slug}/{alt}/"

            language_switch.append(
                f'<a class="btn ghost" href="{href}">{lang_names[alt]}</a>'
            )

        html_page = f'''<!doctype html>
<html lang="{lang}" dir="{"rtl" if lang == "ar" else "ltr"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} — AI Nova</title>
<meta name="description" content="{esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{url}">
{chr(10).join(alternate_links)}
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/assets/{image}">
<meta property="og:site_name" content="AI Nova">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{rel_root}/assets/icon.svg">
<link rel="stylesheet" href="{rel_root}/assets/style.css">
<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>
<style>
.article-static {{
max-width:900px;
margin:auto;
}}
.article-static .article-body {{
font-size:1.12rem;
line-height:1.9;
}}
.article-static .article-body p {{
margin:0 0 24px;
}}
.article-lang {{
display:flex;
gap:8px;
flex-wrap:wrap;
margin-top:25px;
}}
.article-meta {{
display:flex;
gap:12px;
align-items:center;
flex-wrap:wrap;
}}
</style>
</head>
<body>
<header class="topbar">
<a class="brand" href="{rel_root}/">
<span class="brand-mark">N</span>
<span>AI Nova</span>
</a>

<nav class="nav">
<a href="{rel_root}/">Home</a>
<a href="{rel_root}/about.html">About</a>
<a href="{rel_root}/privacy.html">Privacy</a>
<a href="{rel_root}/feed.xml">RSS</a>
</nav>
</header>

<main class="section article-static">

<a class="back-link" href="{rel_root}/">← AI Nova</a>

<img class="article-hero"
src="{rel_root}/assets/{image}"
alt="{esc(tag)}"
loading="eager">

<div class="article-meta">
<span class="tag">{esc(tag)}</span>
</div>

<h1>{esc(title)}</h1>

<p class="article-lead">{esc(description)}</p>

<div class="article-body">
{body}
</div>

<div class="article-lang">
{''.join(language_switch)}
</div>

<div class="share-row">
<button class="btn primary" id="copyLink">Copy link</button>
<a class="btn ghost" href="{rel_root}/">Latest articles</a>
</div>

</main>

<footer>
<p>© <span id="year"></span> AI Nova</p>
<div class="site-links">
<a href="{rel_root}/about.html">About</a>
<a href="{rel_root}/privacy.html">Privacy</a>
<a href="{rel_root}/feed.xml">RSS</a>
</div>
</footer>

<script>
document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("copyLink")?.addEventListener("click", async () => {{
    const btn = document.getElementById("copyLink");
    try {{
        await navigator.clipboard.writeText(location.href);
        btn.textContent = "{'تم نسخ الرابط' if lang == 'ar' else 'Link copied!'}";
        setTimeout(() => btn.textContent = "{'نسخ الرابط' if lang == 'ar' else 'Copy link'}", 1800);
    }} catch(e) {{}}
}});

if(localStorage.getItem("aiNovaTheme") === "dark") {{
    document.body.classList.add("dark");
}}
</script>
</body>
</html>
'''

        (page_dir / "index.html").write_text(html_page, encoding="utf-8")

# ---------- Fix manifest path ----------
manifest = ROOT / "manifest.webmanifest"
if manifest.exists():
    text = manifest.read_text(encoding="utf-8")
    text = text.replace('"start_url": "./"', '"start_url": "./"')
    text = text.replace('"src": "assets/icon.svg"', '"src": "assets/icon.svg"')
    manifest.write_text(text, encoding="utf-8")

# ---------- Fix root-relative URLs in homepage ----------
index = ROOT / "index.html"
if index.exists():
    text = index.read_text(encoding="utf-8")
    text = text.replace('href="/manifest.webmanifest"', 'href="manifest.webmanifest"')
    text = text.replace('href="/assets/style.css"', 'href="assets/style.css"')
    text = text.replace('src="/assets/', 'src="assets/')
    index.write_text(text, encoding="utf-8")

# ---------- Sitemap ----------
today = date.today().isoformat()

urls = [
    BASE + "/",
    BASE + "/about.html",
    BASE + "/privacy.html",
    BASE + "/feed.xml"
]

for article in articles:
    slug = article["id"]
    urls.append(f"{BASE}/articles/{slug}/")

    for lang in ["ar", "fr", "es"]:
        if lang in article["content"]:
            urls.append(f"{BASE}/articles/{slug}/{lang}/")

sitemap_items = "\n".join(
    f"""  <url>
    <loc>{esc(u)}</loc>
    <lastmod>{today}</lastmod>
  </url>"""
    for u in urls
)

(ROOT / "sitemap.xml").write_text(
f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{sitemap_items}
</urlset>
''',
encoding="utf-8"
)

# ---------- RSS ----------
rss_items = []

for article in articles:
    slug = article["id"]
    c = article["content"]["en"]
    link = f"{BASE}/articles/{slug}/"

    rss_items.append(
f'''<item>
<title>{esc(c["title"])}</title>
<link>{link}</link>
<guid>{link}</guid>
<description>{esc(c["text"])}</description>
</item>'''
    )

(ROOT / "feed.xml").write_text(
f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>AI Nova</title>
<link>{BASE}/</link>
<description>Practical AI tools, Android guides and useful digital insights.</description>
<language>en</language>
<atom:link href="{BASE}/feed.xml" rel="self" type="application/rss+xml"
xmlns:atom="http://www.w3.org/2005/Atom"/>
{chr(10).join(rss_items)}
</channel>
</rss>
''',
encoding="utf-8"
)

# ---------- Robots ----------
(ROOT / "robots.txt").write_text(
f'''User-agent: *
Allow: /

Sitemap: {BASE}/sitemap.xml
''',
encoding="utf-8"
)

# ---------- Service worker ----------
cache_files = [
    "./",
    "./index.html",
    "./about.html",
    "./privacy.html",
    "./manifest.webmanifest",
    "./assets/style.css",
    "./assets/app.js",
    "./assets/icon.svg",
    "./assets/img-ai.svg",
    "./assets/img-android.svg",
    "./assets/img-guide.svg",
    "./assets/img-security.svg",
]

for article in articles:
    slug = article["id"]
    cache_files.append(f"./articles/{slug}/")

sw = f'''const CACHE_NAME = "ai-nova-v3";

const CORE = {json.dumps(cache_files, ensure_ascii=False)};

self.addEventListener("install", event => {{
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(CORE))
        .then(() => self.skipWaiting())
    );
}});

self.addEventListener("activate", event => {{
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
}});

self.addEventListener("fetch", event => {{
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then(cached => {{
            if (cached) return cached;

            return fetch(event.request).then(response => {{
                const copy = response.clone();

                caches.open(CACHE_NAME).then(cache => {{
                    cache.put(event.request, copy);
                }});

                return response;
            }}).catch(() => caches.match("./"));
        }})
    );
}});
'''

(ROOT / "sw.js").write_text(sw, encoding="utf-8")

print()
print("================================")
print("AI NOVA V3 BUILD COMPLETE")
print("================================")
print(f"Articles: {len(articles)}")
print(f"Languages: EN / AR / FR / ES")
print(f"Static pages: {len(articles) * 4}")
print("Sitemap: generated")
print("RSS: generated")
print("Service Worker: updated")
print("SEO/JSON-LD: generated")
