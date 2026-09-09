(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function value(id) {
    const el = $(id);
    return el ? el.value : "";
  }

  function num(id, fallback = 0) {
    const n = parseFloat(value(id));
    return Number.isFinite(n) ? n : fallback;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setOutput(text) {
    const out = $("output");
    if (out) {
      if ("value" in out) out.value = String(text);
      else out.textContent = String(text);
      return;
    }

    const result = $("result");
    if (result) result.textContent = String(text);
  }

  function getOutput() {
    const out = $("output");
    if (out) return "value" in out ? out.value : out.textContent;

    const result = $("result");
    return result ? result.textContent : "";
  }

  function copyOutput() {
    const text = getOutput();
    if (!text) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const out = $("output");
      out.focus();
      out.select();
      document.execCommand("copy");
    }
  }

  function downloadOutput() {
    const text = getOutput();
    if (!text) return;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "ai-nova-output.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  function clearTool() {
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.id !== "toolSearch") el.value = "";
    });

    setOutput("");
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function base64Encode(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  function base64Decode(text) {
    const binary = atob(text);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return [...new Uint8Array(hash)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function formatJSON(text) {
    return JSON.stringify(JSON.parse(text), null, 2);
  }

  function timestamp() {
    const d = new Date();
    return {
      unix_seconds: Math.floor(d.getTime() / 1000),
      unix_milliseconds: d.getTime(),
      iso: d.toISOString(),
      local: d.toString()
    };
  }

  function regexTest() {
    const pattern = value("pattern");
    const text = value("text");
    const flags = value("flags");

    try {
      const re = new RegExp(pattern, flags);
      const matches = text.match(re);

      return matches
        ? JSON.stringify({
            valid: true,
            matched: true,
            matches
          }, null, 2)
        : JSON.stringify({
            valid: true,
            matched: false,
            matches: []
          }, null, 2);
    } catch (e) {
      return JSON.stringify({
        valid: false,
        error: e.message
      }, null, 2);
    }
  }

  function calculate(id) {
    switch (id) {
      case "percentage-calculator": {
        const a = num("a");
        const b = num("b");
        return `${b}% of ${a} = ${(a * b / 100).toFixed(2)}`;
      }

      case "discount-calculator": {
        const price = num("price");
        const discount = num("discount");
        const saved = price * discount / 100;
        return JSON.stringify({
          original: price,
          discount_percent: discount,
          saved: Number(saved.toFixed(2)),
          final_price: Number((price - saved).toFixed(2))
        }, null, 2);
      }

      case "tip-calculator": {
        const bill = num("bill");
        const tip = num("tip");
        const amount = bill * tip / 100;
        return JSON.stringify({
          bill,
          tip_percent: tip,
          tip_amount: Number(amount.toFixed(2)),
          total: Number((bill + amount).toFixed(2))
        }, null, 2);
      }

      case "profit-calculator": {
        const revenue = num("revenue");
        const cost = num("cost");
        return JSON.stringify({
          revenue,
          cost,
          profit: Number((revenue - cost).toFixed(2)),
          margin_percent: revenue
            ? Number(((revenue - cost) / revenue * 100).toFixed(2))
            : 0
        }, null, 2);
      }

      case "margin-calculator": {
        const revenue = num("revenue");
        const cost = num("cost");
        const profit = revenue - cost;
        return `${revenue ? (profit / revenue * 100).toFixed(2) : 0}%`;
      }

      case "roi-calculator": {
        const gain = num("gain");
        const investment = num("investment");
        return `${investment ? ((gain - investment) / investment * 100).toFixed(2) : 0}%`;
      }

      case "break-even": {
        const fixed = num("fixed");
        const price = num("price");
        const variable = num("variable");
        const contribution = price - variable;

        return contribution > 0
          ? JSON.stringify({
              contribution_per_unit: contribution,
              break_even_units: Math.ceil(fixed / contribution),
              break_even_revenue: Number((fixed / contribution * price).toFixed(2))
            }, null, 2)
          : "Price must be greater than variable cost.";
      }

      case "simple-interest": {
        const principal = num("principal");
        const rate = num("rate");
        const years = num("years");

        const interest = principal * rate * years / 100;

        return JSON.stringify({
          principal,
          interest: Number(interest.toFixed(2)),
          total: Number((principal + interest).toFixed(2))
        }, null, 2);
      }

      case "compound-interest": {
        const principal = num("principal");
        const rate = num("rate");
        const years = num("years");
        const frequency = Math.max(1, num("frequency", 1));

        const total =
          principal *
          Math.pow(1 + rate / 100 / frequency, frequency * years);

        return JSON.stringify({
          principal,
          rate_percent: rate,
          years,
          final_amount: Number(total.toFixed(2)),
          interest: Number((total - principal).toFixed(2))
        }, null, 2);
      }

      case "conversion-length": {
        const meters = num("value");
        return JSON.stringify({
          meters,
          kilometers: meters / 1000,
          centimeters: meters * 100,
          millimeters: meters * 1000,
          miles: meters / 1609.344,
          feet: meters * 3.280839895,
          inches: meters * 39.37007874
        }, null, 2);
      }

      case "conversion-weight": {
        const kg = num("value");
        return JSON.stringify({
          kilograms: kg,
          grams: kg * 1000,
          pounds: kg * 2.2046226218,
          ounces: kg * 35.27396195
        }, null, 2);
      }

      case "conversion-temperature": {
        const c = num("value");

        return JSON.stringify({
          celsius: c,
          fahrenheit: c * 9 / 5 + 32,
          kelvin: c + 273.15
        }, null, 2);
      }

      case "conversion-area": {
        const m2 = num("value");

        return JSON.stringify({
          square_meters: m2,
          square_kilometers: m2 / 1e6,
          square_feet: m2 * 10.7639104167,
          square_yards: m2 * 1.1959900463,
          hectares: m2 / 10000
        }, null, 2);
      }

      case "conversion-volume": {
        const liters = num("value");

        return JSON.stringify({
          liters,
          milliliters: liters * 1000,
          cubic_meters: liters / 1000,
          gallons_us: liters * 0.2641720524,
          cups_us: liters * 4.2267528377
        }, null, 2);
      }

      case "conversion-speed": {
        const kmh = num("value");

        return JSON.stringify({
          km_h: kmh,
          m_s: kmh / 3.6,
          mph: kmh * 0.6213711922,
          knots: kmh * 0.5399568035
        }, null, 2);
      }

      case "number-base": {
        const n = parseInt(value("value"), 10);

        if (!Number.isFinite(n)) return "Enter a valid integer.";

        return JSON.stringify({
          decimal: n,
          binary: n.toString(2),
          octal: n.toString(8),
          hexadecimal: n.toString(16).toUpperCase()
        }, null, 2);
      }

      default:
        return null;
    }
  }

  window.NovaTools = {
    $,
    value,
    num,
    escapeHTML,
    setOutput,
    getOutput,
    copyOutput,
    downloadOutput,
    clearTool,
    uuid,
    base64Encode,
    base64Decode,
    sha256,
    formatJSON,
    timestamp,
    regexTest,
    calculate
  };

  console.log("AI Nova Modular Tool Engine loaded.");
})();

/* AI NOVA TOOL BRIDGE */
(function () {
  "use strict";

  function toolId() {
    return new URLSearchParams(location.search).get("id") || "";
  }

  function runCurrentTool() {
    const id = toolId();

    try {
      let result = null;

      if (id === "json-formatter") {
        result = NovaTools.formatJSON(NovaTools.value("text"));
      }

      else if (id === "uuid-generator") {
        result = NovaTools.uuid();
      }

      else if (id === "base64-tool") {
        const mode = NovaTools.value("mode") || "encode";
        result = mode === "decode"
          ? NovaTools.base64Decode(NovaTools.value("text"))
          : NovaTools.base64Encode(NovaTools.value("text"));
      }

      else if (id === "timestamp") {
        result = JSON.stringify(NovaTools.timestamp(), null, 2);
      }

      else if (id === "regex-tester") {
        result = NovaTools.regexTest();
      }

      else if (id === "hash-generator") {
        NovaTools.sha256(NovaTools.value("text"))
          .then((hash) => NovaTools.setOutput(hash))
          .catch((e) => NovaTools.setOutput("Error: " + e.message));
        return;
      }

      else {
        result = NovaTools.calculate(id);
      }

      if (result !== null && result !== undefined) {
        NovaTools.setOutput(result);
      } else {
        NovaTools.setOutput(
          "This tool is available in the AI Nova catalog. Engine integration is being expanded."
        );
      }

    } catch (e) {
      NovaTools.setOutput("Error: " + e.message);
    }
  }

  window.runNovaTool = runCurrentTool;

  document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(
      "button, [role='button'], .run-tool, .run"
    );

    buttons.forEach(function (button) {
      const text = (button.textContent || "").trim().toLowerCase();

      if (
        text.includes("run") ||
        text.includes("generate") ||
        text.includes("calculate") ||
        text.includes("convert") ||
        text.includes("format")
      ) {
        button.addEventListener("click", runCurrentTool);
      }
    });
  });

  console.log("AI Nova Tool Bridge loaded.");
})();

/* =========================================================
   AI NOVA LOCAL TOOLS EXPANSION
   Browser-only / zero-cost tools
   ========================================================= */

(function () {
  "use strict";

  const oldCalculate = window.NovaTools && window.NovaTools.calculate;

  const get = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
  };

  const n = (id, fallback = 0) => {
    const v = parseFloat(get(id));
    return Number.isFinite(v) ? v : fallback;
  };

  const clean = (s) => String(s ?? "").trim();

  const words = (s) =>
    clean(s).match(/\b[\p{L}\p{N}'’-]+\b/gu) || [];

  const sentences = (s) =>
    clean(s).split(/[.!?؟]+/).map(x => x.trim()).filter(Boolean);

  const paragraphs = (s) =>
    clean(s).split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);

  function localTool(id) {

    const input = get("input");
    const text = input || get("text") || get("content") || "";

    switch (id) {

      /* ---------- TEXT ---------- */

      case "text-counter":
        return JSON.stringify({
          characters: text.length,
          charactersNoSpaces: text.replace(/\s/g, "").length,
          words: words(text).length,
          sentences: sentences(text).length,
          paragraphs: paragraphs(text).length,
          lines: text ? text.split(/\r?\n/).length : 0
        }, null, 2);

      case "case-converter":
        return [
          "UPPERCASE:",
          text.toUpperCase(),
          "",
          "lowercase:",
          text.toLowerCase(),
          "",
          "Title Case:",
          text.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase())
        ].join("\n");

      case "text-cleaner":
        return text
          .replace(/\r/g, "")
          .replace(/[ \t]+/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

      case "duplicate-remover":
        return [...new Set(text.split(/\r?\n/))].join("\n");

      case "sort-lines":
        return text.split(/\r?\n/).filter(Boolean).sort(
          (a,b) => a.localeCompare(b, undefined, {numeric:true})
        ).join("\n");

      case "reverse-text":
        return [...text].reverse().join("");

      case "word-frequency": {
        const c = {};
        words(text).forEach(w => {
          const k = w.toLowerCase();
          c[k] = (c[k] || 0) + 1;
        });
        return Object.entries(c)
          .sort((a,b) => b[1]-a[1])
          .map(([w,v]) => `${w}: ${v}`)
          .join("\n");
      }

      case "character-frequency": {
        const c = {};
        [...text.replace(/\s/g, "")].forEach(ch => {
          c[ch] = (c[ch] || 0) + 1;
        });
        return Object.entries(c)
          .sort((a,b) => b[1]-a[1])
          .map(([ch,v]) => `${ch}: ${v}`)
          .join("\n");
      }

      case "sentence-counter":
        return String(sentences(text).length);

      case "paragraph-counter":
        return String(paragraphs(text).length);

      case "reading-time":
        return `${Math.max(1, Math.ceil(words(text).length / 200))} minute(s)`;

      case "lorem-generator": {
        const count = Math.max(1, Math.min(100, n("count", 3)));
        const base = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";
        const arr = base.split(" ");
        let out = [];
        for (let i=0;i<count*20;i++) out.push(arr[i % arr.length]);
        return out.join(" ") + ".";
      }

      /* ---------- ENCODING ---------- */

      case "url-encoder":
        return encodeURIComponent(text);

      case "url-decoder":
        try { return decodeURIComponent(text); }
        catch(e) { return "Invalid URL encoding."; }

      case "html-entities":
        return text.replace(/[&<>"']/g, c => ({
          "&":"&amp;",
          "<":"&lt;",
          ">":"&gt;",
          '"':"&quot;",
          "'":"&#39;"
        }[c]));

      case "unicode-converter":
        return [...text]
          .map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")} ${c}`)
          .join("\n");

      case "ascii-converter":
        return [...text]
          .map(c => c.charCodeAt(0))
          .join(" ");

      case "binary-converter":
        return [...text]
          .map(c => c.charCodeAt(0).toString(2).padStart(8,"0"))
          .join(" ");

      case "hex-converter":
        return [...text]
          .map(c => c.charCodeAt(0).toString(16).padStart(2,"0"))
          .join(" ");

      case "octal-converter":
        return [...text]
          .map(c => c.charCodeAt(0).toString(8))
          .join(" ");

      /* ---------- JSON / DATA ---------- */

      case "json-to-csv": {
        try {
          const data = JSON.parse(text);
          const arr = Array.isArray(data) ? data : [data];
          const keys = [...new Set(arr.flatMap(x => Object.keys(x || {})))];
          const esc = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
          return [
            keys.map(esc).join(","),
            ...arr.map(row => keys.map(k => esc(row[k])).join(","))
          ].join("\n");
        } catch(e) {
          return "Invalid JSON.";
        }
      }

      case "csv-to-json": {
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (!lines.length) return "[]";
        const parse = line => {
          const out=[];
          let cur="", quoted=false;
          for(let i=0;i<line.length;i++){
            const ch=line[i];
            if(ch === '"' && line[i+1] === '"'){
              cur += '"'; i++; continue;
            }
            if(ch === '"') quoted=!quoted;
            else if(ch === "," && !quoted){
              out.push(cur); cur="";
            } else cur += ch;
          }
          out.push(cur);
          return out;
        };
        const headers=parse(lines[0]).map(x=>x.trim());
        const result=lines.slice(1).map(line=>{
          const vals=parse(line);
          const obj={};
          headers.forEach((h,i)=>obj[h]=vals[i] ?? "");
          return obj;
        });
        return JSON.stringify(result,null,2);
      }

      case "query-string-parser": {
        const q = text.replace(/^[?#]/,"");
        const params = new URLSearchParams(q);
        const obj={};
        for(const [k,v] of params) {
          if(obj[k] !== undefined)
            obj[k] = Array.isArray(obj[k]) ? [...obj[k],v] : [obj[k],v];
          else obj[k]=v;
        }
        return JSON.stringify(obj,null,2);
      }

      case "json-path-helper":
        try {
          const obj=JSON.parse(text);
          const path=get("path") || "$";
          if(path === "$") return JSON.stringify(obj,null,2);
          const parts=path.replace(/^\$\.?/,"").split(".").filter(Boolean);
          let cur=obj;
          for(const p of parts) cur=cur?.[p];
          return JSON.stringify(cur,null,2);
        } catch(e) {
          return "Invalid JSON or path.";
        }

      /* ---------- HTML / MARKDOWN ---------- */

      case "text-to-html":
        return text
          .split(/\r?\n/)
          .map(x => `<p>${escapeHTML(x)}</p>`)
          .join("\n");

      case "html-to-text": {
        const div=document.createElement("div");
        div.innerHTML=text;
        return div.textContent || div.innerText || "";
      }

      case "markdown-to-html": {
        let s=escapeHTML(text);
        s=s.replace(/^### (.*)$/gm,"<h3>$1</h3>");
        s=s.replace(/^## (.*)$/gm,"<h2>$1</h2>");
        s=s.replace(/^# (.*)$/gm,"<h1>$1</h1>");
        s=s.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
        s=s.replace(/\*(.*?)\*/g,"<em>$1</em>");
        s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
        s=s.replace(/\n/g,"<br>\n");
        return s;
      }

      /* ---------- SEO ---------- */

      case "slug-generator":
        return text
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[^\p{L}\p{N}]+/gu,"-")
          .replace(/^-+|-+$/g,"");

      case "keyword-density": {
        const keyword=clean(get("keyword")).toLowerCase();
        if(!keyword) return "Enter a keyword.";
        const total=words(text).length;
        const count=(text.toLowerCase().match(
          new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g")
        )||[]).length;
        return `${count} occurrence(s)\nDensity: ${total ? ((count/total)*100).toFixed(2) : 0}%`;
      }

      case "meta-preview": {
        const title=get("title") || text;
        const description=get("description") || "";
        return `TITLE (${title.length} chars)\n${title}\n\nDESCRIPTION (${description.length} chars)\n${description}`;
      }

      case "canonical-generator":
        return `<link rel="canonical" href="${clean(get("url") || text)}">`;

      case "open-graph-generator": {
        const title=get("title") || "";
        const description=get("description") || "";
        const url=get("url") || "";
        const image=get("image") || "";
        return `<meta property="og:title" content="${escapeHTML(title)}">
<meta property="og:description" content="${escapeHTML(description)}">
<meta property="og:url" content="${escapeHTML(url)}">
<meta property="og:image" content="${escapeHTML(image)}">`;
      }

      case "twitter-card-generator": {
        const title=get("title") || "";
        const description=get("description") || "";
        const image=get("image") || "";
        return `<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHTML(title)}">
<meta name="twitter:description" content="${escapeHTML(description)}">
<meta name="twitter:image" content="${escapeHTML(image)}">`;
      }

      case "utm-builder": {
        const url=clean(get("url") || text);
        const params=new URLSearchParams();
        ["source","medium","campaign","term","content"].forEach(k=>{
          const v=clean(get(k));
          if(v) params.set(`utm_${k}`,v);
        });
        const sep=url.includes("?") ? "&" : "?";
        return params.toString() ? url+sep+params.toString() : url;
      }

      case "robots-generator":
        return `User-agent: *
Allow: /

Sitemap: ${clean(get("sitemap") || text || location.origin + "/sitemap.xml")}`;

      /* ---------- FINANCE ---------- */

      case "savings-calculator": {
        const initial=n("initial");
        const monthly=n("monthly");
        const rate=n("rate");
        const months=n("months",12);
        const r=rate/100/12;
        const future=r ? initial*Math.pow(1+r,months)+monthly*((Math.pow(1+r,months)-1)/r)
                       : initial+monthly*months;
        return future.toFixed(2);
      }

      case "markup-calculator": {
        const cost=n("cost");
        const markup=n("markup");
        return (cost*(1+markup/100)).toFixed(2);
      }

      case "commission-calculator":
        return (n("amount") * n("commission") / 100).toFixed(2);

      case "conversion-time": {
        const v=n("value");
        const from=clean(get("from")).toLowerCase();
        const factors={seconds:1,minutes:60,hours:3600,days:86400};
        const sec=v*(factors[from]||1);
        const to=clean(get("to")).toLowerCase();
        return (sec/(factors[to]||1)).toString();
      }

      case "percentage-calculator":
        return (n("value") * n("percentage") / 100).toFixed(2);

      case "discount-calculator": {
        const price=n("price");
        const discount=n("discount");
        const saved=price*discount/100;
        return JSON.stringify({
          original:price,
          discount:saved,
          final:price-saved
        },null,2);
      }

      case "tip-calculator": {
        const bill=n("bill");
        const tip=n("tip",15);
        const amount=bill*tip/100;
        return JSON.stringify({
          tip:amount,
          total:bill+amount
        },null,2);
      }

      /* ---------- GENERATORS ---------- */

      case "random-number": {
        const min=n("min",0);
        const max=n("max",100);
        return String(Math.floor(Math.random()*(max-min+1))+min);
      }

      case "random-string": {
        const length=Math.max(1,Math.min(1000,n("length",16)));
        const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const arr=new Uint32Array(length);
        crypto.getRandomValues(arr);
        return [...arr].map(x=>chars[x%chars.length]).join("");
      }

      case "password-generator": {
        const length=Math.max(4,Math.min(128,n("length",16)));
        const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
        const arr=new Uint32Array(length);
        crypto.getRandomValues(arr);
        return [...arr].map(x=>chars[x%chars.length]).join("");
      }

      case "color-generator":
        return "#" + crypto.getRandomValues(new Uint8Array(3))
          .map(x=>x.toString(16).padStart(2,"0")).join("");

      case "color-palette": {
        const base=get("color") || "#6366f1";
        const hex=base.replace("#","");
        const r=parseInt(hex.slice(0,2),16)||99;
        const g=parseInt(hex.slice(2,4),16)||102;
        const b=parseInt(hex.slice(4,6),16)||241;
        return [0.6,0.8,1,1.2,1.4].map(f=>{
          return "#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v*f)))
            .toString(16).padStart(2,"0")).join("");
        }).join("\n");
      }

      /* ---------- CSS ---------- */

      case "css-gradient": {
        const c1=get("color1") || "#6366f1";
        const c2=get("color2") || "#ec4899";
        const angle=get("angle") || "135";
        return `background: linear-gradient(${angle}deg, ${c1}, ${c2});`;
      }

      case "box-shadow": {
        const x=n("x",0);
        const y=n("y",10);
        const blur=n("blur",20);
        const spread=n("spread",0);
        const color=get("color") || "rgba(0,0,0,.25)";
        return `box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color};`;
      }

      case "border-radius": {
        const radius=get("radius") || "12px";
        return `border-radius: ${radius};`;
      }

      case "flexbox-generator":
        return `.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}`;

      case "grid-generator":
        return `.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}`;

      /* ---------- SECURITY ---------- */

      case "password-strength": {
        let score=0;
        if(text.length>=8) score++;
        if(text.length>=12) score++;
        if(/[a-z]/.test(text)) score++;
        if(/[A-Z]/.test(text)) score++;
        if(/[0-9]/.test(text)) score++;
        if(/[^A-Za-z0-9]/.test(text)) score++;
        const level=score<=2?"Weak":score<=4?"Medium":"Strong";
        return `${level} (${score}/6)`;
      }

      case "jwt-decoder": {
        try {
          const p=text.split(".");
          if(p.length<2) return "Invalid JWT.";
          const decode=s=>JSON.parse(
            decodeURIComponent(
              atob(s.replace(/-/g,"+").replace(/_/g,"/"))
              .split("").map(c=>"%"+("00"+c.charCodeAt(0).toString(16)).slice(-2)).join("")
            )
          );
          return JSON.stringify({
            header:decode(p[0]),
            payload:decode(p[1])
          },null,2);
        } catch(e) {
          return "Invalid JWT.";
        }
      }

      /* ---------- FILE / SIZE ---------- */

      case "file-size-converter": {
        const value=n("value",0);
        const from=(get("from")||"bytes").toLowerCase();
        const to=(get("to")||"megabytes").toLowerCase();
        const units={
          bytes:1,
          kb:1024,
          kilobytes:1024,
          mb:1024**2,
          megabytes:1024**2,
          gb:1024**3,
          gigabytes:1024**3,
          tb:1024**4,
          terabytes:1024**4
        };
        const bytes=value*(units[from]||1);
        return (bytes/(units[to]||1)).toString();
      }

      default:
        return null;
    }
  }

  const original = window.NovaTools?.calculate;

  window.NovaTools.calculate = function(id) {
    try {
      const result=localTool(id);
      if(result !== null) return result;
    } catch(err) {
      return "Tool error: " + err.message;
    }

    if(typeof original === "function") {
      return original(id);
    }

    return null;
  };

  window.NovaTools.localTool = localTool;

  

/* ============================================================
   AI NOVA UNIVERSAL TOOL ROUTER
   Browser-only utilities — no API required
   ============================================================ */
(function(){
  "use strict";

  const oldCalculate = window.NovaTools.calculate;

  function n(id){
    const v=parseFloat(window.NovaTools.value(id));
    return Number.isFinite(v) ? v : 0;
  }

  function txt(id){
    return String(window.NovaTools.value(id) || "");
  }

  function fmt(v){
    if(!Number.isFinite(v)) return "Invalid calculation";
    return Number(v.toFixed(8)).toString();
  }

  function json(obj){
    return JSON.stringify(obj,null,2);
  }

  function universal(id){

    /* ---------- TEXT ---------- */

    if(id==="text-counter"){
      const x=txt("input");
      return json({
        characters:x.length,
        charactersWithoutSpaces:x.replace(/\s/g,"").length,
        words:(x.trim().match(/\S+/g)||[]).length,
        lines:x ? x.split(/\r?\n/).length : 0
      });
    }

    if(id==="case-converter"){
      const x=txt("input");
      return json({
        upper:x.toUpperCase(),
        lower:x.toLowerCase(),
        title:x.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()),
        sentence:x.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g,c=>c.toUpperCase())
      });
    }

    if(id==="reverse-text"){
      return txt("input").split("").reverse().join("");
    }

    if(id==="duplicate-remover"){
      return [...new Set(txt("input").split(/\r?\n/))].join("\n");
    }

    if(id==="sort-lines"){
      return txt("input").split(/\r?\n/).filter(Boolean).sort().join("\n");
    }

    if(id==="word-frequency"){
      const words=(txt("input").toLowerCase().match(/\b[\p{L}\p{N}'-]+\b/gu)||[]);
      const map={};
      for(const w of words) map[w]=(map[w]||0)+1;
      return json(Object.fromEntries(Object.entries(map).sort((a,b)=>b[1]-a[1])));
    }

    if(id==="character-frequency"){
      const map={};
      for(const c of txt("input")){
        if(/\s/.test(c)) continue;
        map[c]=(map[c]||0)+1;
      }
      return json(map);
    }

    if(id==="sentence-counter"){
      return String((txt("input").match(/[^.!?]+[.!?]+/g)||[]).length);
    }

    if(id==="paragraph-counter"){
      return String(txt("input").split(/\n\s*\n/).filter(x=>x.trim()).length);
    }

    if(id==="reading-time"){
      const words=(txt("input").trim().match(/\S+/g)||[]).length;
      return `${words} words\nEstimated reading time: ${Math.max(1,Math.ceil(words/200))} minute(s)`;
    }

    if(id==="slug-generator"){
      return txt("input")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-+|-+$/g,"");
    }

    /* ---------- ENCODING ---------- */

    if(id==="url-encoder")
      return encodeURIComponent(txt("input"));

    if(id==="url-decoder"){
      try{return decodeURIComponent(txt("input"))}
      catch(e){return "Invalid URL encoding"}
    }

    if(id==="html-entities"){
      const el=document.createElement("textarea");
      el.textContent=txt("input");
      return el.innerHTML;
    }

    if(id==="unicode-converter"){
      return [...txt("input")].map(c=>"U+"+c.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")).join(" ");
    }

    if(id==="ascii-converter"){
      return [...txt("input")].map(c=>c.charCodeAt(0)).join(" ");
    }

    if(id==="binary-converter"){
      return txt("input").split(/\s+/).filter(Boolean)
        .map(x=>String.fromCharCode(parseInt(x,2))).join("");
    }

    if(id==="hex-converter"){
      return txt("input").split(/\s+/).filter(Boolean)
        .map(x=>String.fromCharCode(parseInt(x,16))).join("");
    }

    if(id==="octal-converter"){
      return txt("input").split(/\s+/).filter(Boolean)
        .map(x=>String.fromCharCode(parseInt(x,8))).join("");
    }

    /* ---------- CALCULATORS ---------- */

    if(id==="percentage-calculator"){
      return fmt(n("value")*n("rate")/100);
    }

    if(id==="discount-calculator"){
      const price=n("value"), rate=n("rate");
      return json({
        discount:price*rate/100,
        finalPrice:price-(price*rate/100)
      });
    }

    if(id==="tip-calculator"){
      const bill=n("value"), rate=n("rate");
      return json({
        tip:bill*rate/100,
        total:bill+(bill*rate/100)
      });
    }

    if(id==="markup-calculator"){
      const cost=n("value"), rate=n("rate");
      return json({
        markup:cost*rate/100,
        sellingPrice:cost*(1+rate/100)
      });
    }

    if(id==="commission-calculator"){
      const amount=n("value"), rate=n("rate");
      return json({
        commission:amount*rate/100,
        remaining:amount-(amount*rate/100)
      });
    }

    if(id==="compound-interest"){
      const principal=n("principal")||n("initial");
      const rate=n("rate")/100;
      const years=n("years")||n("months")/12;
      const amount=principal*Math.pow(1+rate,years);
      return json({
        principal,
        interest:amount-principal,
        total:amount
      });
    }

    if(id==="simple-interest"){
      const principal=n("principal")||n("value");
      const rate=n("rate")/100;
      const years=n("years");
      const interest=principal*rate*years;
      return json({
        interest,
        total:principal+interest
      });
    }

    if(id==="savings-calculator"){
      const initial=n("initial");
      const monthly=n("monthly");
      const rate=n("rate")/100/12;
      const months=n("months");

      let total=initial;

      for(let i=0;i<months;i++)
        total=total*(1+rate)+monthly;

      return json({
        deposited:initial+(monthly*months),
        interest:total-(initial+(monthly*months)),
        total
      });
    }

    /* ---------- CONVERSIONS ---------- */

    if(id==="conversion-temperature"){
      const v=n("value");
      const from=txt("from").toLowerCase();
      let c=v;

      if(from==="f"||from.includes("fahrenheit"))
        c=(v-32)*5/9;

      if(from==="k"||from.includes("kelvin"))
        c=v-273.15;

      return json({
        celsius:c,
        fahrenheit:c*9/5+32,
        kelvin:c+273.15
      });
    }

    if(id==="conversion-length"){
      const v=n("value");
      const from=txt("from").toLowerCase();

      const units={
        m:1,
        km:1000,
        cm:.01,
        mm:.001,
        mi:1609.344,
        yd:.9144,
        ft:.3048,
        in:.0254
      };

      const base=v*(units[from]||1);

      return json(Object.fromEntries(
        Object.entries(units).map(([k,f])=>[k,base/f])
      ));
    }

    if(id==="file-size-converter"){
      const v=n("value");
      return json({
        bytes:v,
        KB:v/1024,
        MB:v/1024**2,
        GB:v/1024**3
      });
    }

    /* ---------- SEO ---------- */

    if(id==="keyword-density"){
      const input=txt("input").toLowerCase();
      const keyword=txt("keyword").toLowerCase().trim();
      const words=(input.match(/\S+/g)||[]).length;
      const matches=keyword ? (input.match(new RegExp(
        keyword.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"
      ))||[]).length : 0;

      return json({
        words,
        keyword,
        occurrences:matches,
        density:words ? fmt(matches/words*100)+"%" : "0%"
      });
    }

    if(id==="meta-preview"){
      const title=txt("title");
      const description=txt("description");

      return `<title>${escapeHTML(title)}</title>
<meta name="description" content="${escapeHTML(description)}">

TITLE LENGTH: ${title.length}
DESCRIPTION LENGTH: ${description.length}`;

    }

    /* ---------- RANDOM ---------- */

    if(id==="random-number"){
      const min=n("min")||0;
      const max=n("max")||100;
      return String(Math.floor(Math.random()*(max-min+1))+min);
    }

    if(id==="random-string"){
      const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const length=Math.max(1,Math.floor(n("length")||16));
      let out="";
      for(let i=0;i<length;i++)
        out+=chars[Math.floor(Math.random()*chars.length)];
      return out;
    }

    /* ---------- CSS ---------- */

    if(id==="css-gradient"){
      const c1=txt("color1")||"#7c5cff";
      const c2=txt("color2")||"#00d4ff";
      return `background: linear-gradient(135deg, ${c1}, ${c2});`;
    }

    if(id==="box-shadow"){
      return "box-shadow: " + n("x") + "px " + n("y") + "px " + (n("blur")||10) + "px " + (n("spread")||0) + "px " + (txt("color")||"rgba(0,0,0,.25)") + ";";
    }

    if(id==="border-radius"){
      const r=n("value");
      return `border-radius: ${r}px;`;
    }

    return null;
  }

  const universalCalculate=window.NovaTools.calculate;

  window.NovaTools.calculate=function(id){
    try{
      const result=universal(id);
      if(result!==null && result!==undefined) return result;
    }catch(e){
      return "Tool error: "+e.message;
    }

    return universalCalculate(id);
  };

  console.log("AI NOVA UNIVERSAL TOOL ROUTER: READY");
})();

console.log("AI NOVA LOCAL TOOLS EXPANSION: READY");

})();

/* ============================================================
   AI NOVA — UNIVERSAL LOCAL IMPLEMENTATION LAYER
   Browser-only / zero-cost tools
   ============================================================ */

(function(){

  "use strict";

  const previousCalculate = NovaTools.calculate;

  function V(id){
    const el=document.getElementById(id);
    return el ? (el.value ?? el.textContent ?? "") : "";
  }

  function N(id){
    const x=parseFloat(V(id));
    return Number.isFinite(x) ? x : 0;
  }

  function out(value){
    if(value === undefined || value === null) return "";
    return String(value);
  }

  function round(x,n=2){
    const p=Math.pow(10,n);
    return Math.round((x + Number.EPSILON)*p)/p;
  }

  function localExpansion(id){

    /* ---------- BASIC CALCULATORS ---------- */

    if(id==="percentage-calculator"){
      return round(N("value") * N("rate") / 100);
    }

    if(id==="discount-calculator"){
      const price=N("value");
      const rate=N("rate");
      return JSON.stringify({
        original:price,
        discount:round(price*rate/100),
        final:round(price-(price*rate/100))
      },null,2);
    }

    if(id==="tip-calculator"){
      const bill=N("value");
      const rate=N("rate");
      return JSON.stringify({
        tip:round(bill*rate/100),
        total:round(bill+(bill*rate/100))
      },null,2);
    }

    if(id==="commission-calculator"){
      const amount=N("value");
      const rate=N("rate");
      return JSON.stringify({
        commission:round(amount*rate/100),
        afterCommission:round(amount-(amount*rate/100))
      },null,2);
    }

    if(id==="markup-calculator"){
      const cost=N("value");
      const rate=N("rate");
      return JSON.stringify({
        markup:round(cost*rate/100),
        sellingPrice:round(cost+(cost*rate/100))
      },null,2);
    }

    if(id==="simple-interest"){
      const p=N("principal");
      const r=N("rate");
      const years=N("years");
      const interest=p*r*years/100;
      return JSON.stringify({
        principal:p,
        interest:round(interest),
        total:round(p+interest)
      },null,2);
    }

    if(id==="compound-interest"){
      const p=N("principal");
      const r=N("rate");
      const years=N("years");
      const amount=p*Math.pow(1+r/100,years);
      return JSON.stringify({
        principal:p,
        interest:round(amount-p),
        total:round(amount)
      },null,2);
    }

    if(id==="savings-calculator"){
      const initial=N("initial");
      const monthly=N("monthly");
      const rate=N("rate");
      const months=N("months");
      const mr=rate/100/12;

      let total=initial;

      if(mr===0){
        total=initial+monthly*months;
      }else{
        total=initial*Math.pow(1+mr,months)
          + monthly*((Math.pow(1+mr,months)-1)/mr);
      }

      return JSON.stringify({
        initial,
        contributions:round(monthly*months),
        total:round(total),
        interest:round(total-initial-monthly*months)
      },null,2);
    }

    if(id==="salary-calculator"){
      const salary=N("value");
      const rate=N("rate");
      return JSON.stringify({
        gross:salary,
        deduction:round(salary*rate/100),
        net:round(salary-(salary*rate/100))
      },null,2);
    }

    if(id==="loan-calculator"){
      const p=N("principal");
      const annual=N("rate");
      const years=N("years");
      const months=years*12;
      const r=annual/100/12;

      if(!months) return "Years must be greater than 0.";

      let payment;

      if(r===0){
        payment=p/months;
      }else{
        payment=p*r*Math.pow(1+r,months)/
          (Math.pow(1+r,months)-1);
      }

      return JSON.stringify({
        monthlyPayment:round(payment),
        totalPayment:round(payment*months),
        totalInterest:round(payment*months-p)
      },null,2);
    }

    if(id==="age-calculator"){
      const value=V("input");
      const d=new Date(value);

      if(Number.isNaN(d.getTime()))
        return "Enter a valid birth date.";

      const now=new Date();
      let age=now.getFullYear()-d.getFullYear();

      const beforeBirthday=
        now.getMonth()<d.getMonth() ||
        (now.getMonth()===d.getMonth() &&
         now.getDate()<d.getDate());

      if(beforeBirthday) age--;

      return "Age: "+age+" years";
    }

    if(id==="days-calculator"){
      const a=new Date(V("from"));
      const b=new Date(V("to"));

      if(Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()))
        return "Enter valid dates.";

      return String(Math.round(
        Math.abs(b-a)/86400000
      ))+" days";
    }

    if(id==="date-difference"){
      const a=new Date(V("from"));
      const b=new Date(V("to"));

      if(Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()))
        return "Enter valid dates.";

      const days=Math.round(Math.abs(b-a)/86400000);

      return JSON.stringify({
        days,
        weeks:round(days/7,2),
        months:round(days/30.4375,2),
        years:round(days/365.25,2)
      },null,2);
    }

    /* ---------- TEXT / CONTENT ---------- */

    if(id==="code-counter"){
      const s=V("input");
      return JSON.stringify({
        characters:s.length,
        lines:s ? s.split(/\r?\n/).length : 0,
        words:(s.match(/\b[\w$]+\b/g)||[]).length
      },null,2);
    }

    if(id==="diff-checker"){
      const a=V("input");
      const b=V("input2");

      const A=a.split(/\r?\n/);
      const B=b.split(/\r?\n/);

      const added=B.filter(x=>!A.includes(x));
      const removed=A.filter(x=>!B.includes(x));

      return JSON.stringify({
        added,
        removed,
        identical:a===b
      },null,2);
    }

    /* ---------- SEO ---------- */

    if(id==="robots-generator"){
      return "User-agent: *\nAllow: /\n\nSitemap: "+(V("url")||"https://example.com")+"/sitemap.xml";
    }

    if(id==="sitemap-generator"){
      const url=(V("url")||"https://example.com").replace(/\/$/,"");

      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}</loc>
  </url>
</urlset>`;
    }

    if(id==="canonical-generator"){
      const url=V("url");

      return '<link rel="canonical" href="'+
        url.replace(/"/g,"&quot;")+'">';
    }

    if(id==="open-graph-generator"){
      return [
        '<meta property="og:title" content="'+V("title")+'">',
        '<meta property="og:description" content="'+V("description")+'">',
        '<meta property="og:url" content="'+V("url")+'">',
        '<meta property="og:type" content="website">'
      ].join("\n");
    }

    if(id==="twitter-card-generator"){
      return [
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="'+V("title")+'">',
        '<meta name="twitter:description" content="'+V("description")+'">',
        '<meta name="twitter:image" content="'+V("image")+'">'
      ].join("\n");
    }

    if(id==="schema-generator"){
      return JSON.stringify({
        "@context":"https://schema.org",
        "@type":"WebPage",
        "name":V("title"),
        "description":V("description"),
        "url":V("url")
      },null,2);
    }

    if(id==="faq-schema"){
      return JSON.stringify({
        "@context":"https://schema.org",
        "@type":"FAQPage",
        "mainEntity":[]
      },null,2);
    }

    if(id==="breadcrumb-schema"){
      return JSON.stringify({
        "@context":"https://schema.org",
        "@type":"BreadcrumbList",
        "itemListElement":[]
      },null,2);
    }

    if(id==="redirect-generator"){
      const url=V("url");

      return 'Redirect 301 / '+url;
    }

    /* ---------- DEVELOPER ---------- */

    if(id==="gitignore-generator"){
      return [
        "# OS",
        ".DS_Store",
        "Thumbs.db",
        "",
        "# Node",
        "node_modules/",
        "npm-debug.log*",
        "",
        "# Environment",
        ".env",
        ".env.*",
        "",
        "# Build",
        "dist/",
        "build/"
      ].join("\n");
    }

    if(id==="license-generator"){
      return "MIT License\n\nCopyright (c) "+new Date().getFullYear()+" "+V("input")+
        "\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.";
    }

    if(id==="readme-generator"){
      const name=V("title")||"Project";

      return "# "+name+
        "\n\n"+(V("description")||"Project description.")+
        "\n\n## Installation\n\n```bash\nnpm install\n```\n\n## Usage\n\nDescribe how to use this project here.";
    }

    if(id==="curl-generator"){
      const url=V("url")||"https://example.com";
      return "curl -X GET '"+url+"'";
    }

    if(id==="api-request-builder"){
      const url=V("url")||"https://example.com";
      return JSON.stringify({
        method:"GET",
        url,
        headers:{},
        body:null
      },null,2);
    }

    if(id==="query-string-parser"){
      const input=V("input").replace(/^\?/,"");
      const params=new URLSearchParams(input);
      const obj={};

      for(const [k,v] of params.entries())
        obj[k]=v;

      return JSON.stringify(obj,null,2);
    }

    if(id==="json-path-helper"){
      try{
        const data=JSON.parse(V("input"));
        return JSON.stringify(data,null,2);
      }catch(e){
        return "Invalid JSON: "+e.message;
      }
    }

    /* ---------- RANDOM / GENERATORS ---------- */

    if(id==="random-number"){
      const min=N("min");
      const max=N("max") || 100;

      return String(
        Math.floor(Math.random()*(max-min+1))+min
      );
    }

    if(id==="random-string"){
      const chars=
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      const length=Math.max(1,Math.floor(N("length")||16));
      let result="";

      for(let i=0;i<length;i++)
        result+=chars[Math.floor(Math.random()*chars.length)];

      return result;
    }

    if(id==="password-generator"){
      const chars=
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

      const length=Math.max(8,Math.floor(N("length")||16));
      let result="";

      for(let i=0;i<length;i++)
        result+=chars[Math.floor(Math.random()*chars.length)];

      return result;
    }

    if(id==="color-generator"){
      const hex=Math.floor(Math.random()*0xffffff)
        .toString(16)
        .padStart(6,"0");

      return "#"+hex;
    }

    if(id==="color-palette"){
      const colors=[];

      for(let i=0;i<5;i++){
        colors.push(
          "#"+Math.floor(Math.random()*0xffffff)
            .toString(16)
            .padStart(6,"0")
        );
      }

      return colors.join("\n");
    }

    /* ---------- TIME / PRODUCTIVITY ---------- */

    if(id==="pomodoro-timer"){
      return "25:00";
    }

    if(id==="countdown-timer"){
      return "00:00:00";
    }

    if(id==="stopwatch"){
      return "00:00:00";
    }

    return null;
  }

  NovaTools.calculate=function(id){

    try{

      const result=localExpansion(id);

      if(result!==null && result!==undefined){
        return result;
      }

    }catch(e){

      return "Tool error: "+e.message;

    }

    return previousCalculate(id);
  };

  NovaTools.localExpansion=localExpansion;

  console.log(
    "AI NOVA UNIVERSAL LOCAL IMPLEMENTATION LAYER: READY"
  );

})();
