
(() => {
"use strict";

window.AINovaV52 = (() => {

const text = v => String(v ?? "");

function download(name, content, type="text/plain") {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url;
    a.download=name;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function words(s){
    return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function textStats(s){
    return [
        "Words: " + words(s),
        "Characters: " + s.length,
        "Characters (no spaces): " + s.replace(/\s/g,"").length,
        "Lines: " + (s ? s.split(/\r?\n/).length : 0),
        "Bytes (UTF-8): " + new TextEncoder().encode(s).length
    ].join("\n");
}

function removeDuplicates(s){
    return [...new Set(s.split(/\r?\n/))].join("\n");
}

function removeEmptyLines(s){
    return s.split(/\r?\n/).filter(x=>x.trim()!=="").join("\n");
}

function sortLines(s){
    return s.split(/\r?\n/).sort((a,b)=>a.localeCompare(b)).join("\n");
}

function reverseWords(s){
    return s.trim().split(/\s+/).reverse().join(" ");
}

function slug(s){
    return s.normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-+|-+$/g,"");
}

function jsonFormat(s){
    return JSON.stringify(JSON.parse(s),null,2);
}

function jsonMinify(s){
    return JSON.stringify(JSON.parse(s));
}

function jsonValidate(s){
    try{
        JSON.parse(s);
        return "VALID JSON";
    }catch(e){
        return "INVALID JSON\n\n"+e.message;
    }
}

function csvToJson(s){
    const lines=s.trim().split(/\r?\n/);
    if(!lines.length)return "[]";

    const headers=lines[0].split(",").map(x=>x.trim());

    return JSON.stringify(
        lines.slice(1).map(line=>{
            const values=line.split(",");
            const obj={};
            headers.forEach((h,i)=>obj[h]=(values[i]??"").trim());
            return obj;
        }),
        null,
        2
    );
}

function jsonToCsv(s){
    const arr=JSON.parse(s);

    if(!Array.isArray(arr) || !arr.length)
        throw Error("Expected a JSON array");

    const headers=[...new Set(arr.flatMap(x=>Object.keys(x)))];

    return [
        headers.join(","),
        ...arr.map(row =>
            headers.map(h =>
                `"${String(row[h]??"").replace(/"/g,'""')}"`
            ).join(",")
        )
    ].join("\n");
}

function base64Encode(s){
    return btoa(unescape(encodeURIComponent(s)));
}

function base64Decode(s){
    return decodeURIComponent(escape(atob(s)));
}

function urlEncode(s){
    return encodeURIComponent(s);
}

function urlDecode(s){
    return decodeURIComponent(s);
}

function htmlEntities(s){
    const div=document.createElement("div");
    div.textContent=s;
    return div.innerHTML;
}

function regex(s,pattern,flags="g"){
    const r=new RegExp(pattern,flags);
    const m=[...s.matchAll(r)];
    return "Matches: "+m.length+
        (m.length ? "\n\n"+m.map(x=>x[0]).join("\n") : "");
}

function htmlMin(s){
    return s
        .replace(/<!--[\s\S]*?-->/g,"")
        .replace(/\s+/g," ")
        .replace(/>\s+</g,"><")
        .trim();
}

function cssMin(s){
    return s
        .replace(/\/\*[\s\S]*?\*\//g,"")
        .replace(/\s+/g," ")
        .replace(/\s*([{}:;,])\s*/g,"$1")
        .trim();
}

function jsMin(s){
    return s
        .replace(/\/\*[\s\S]*?\*\//g,"")
        .replace(/(^|[^:])\/\/.*$/gm,"$1")
        .replace(/\s+/g," ")
        .trim();
}

function hexRgb(s){
    let h=s.trim().replace("#","");
    if(h.length===3)h=[...h].map(x=>x+x).join("");
    if(!/^[0-9a-f]{6}$/i.test(h))
        throw Error("Invalid HEX color");

    const n=parseInt(h,16);

    return `rgb(${n>>16}, ${(n>>8)&255}, ${n&255})`;
}

function rgbHex(s){
    const m=s.match(/\d+/g);

    if(!m || m.length<3)
        throw Error("Use RGB values such as 255, 0, 128");

    return "#"+m.slice(0,3)
        .map(x=>Math.max(0,Math.min(255,+x))
        .toString(16).padStart(2,"0"))
        .join("");
}

function percentage(a,b){
    if(!b)throw Error("Total cannot be zero");
    return ((a/b)*100).toFixed(2)+"%";
}

function discount(price,p){
    const saved=price*p/100;
    return [
        "Original: "+price,
        "Discount: "+saved.toFixed(2),
        "Final: "+(price-saved).toFixed(2)
    ].join("\n");
}

function tip(price,p){
    const amount=price*p/100;
    return [
        "Bill: "+price,
        "Tip: "+amount.toFixed(2),
        "Total: "+(price+amount).toFixed(2)
    ].join("\n");
}

function randomString(length=16){
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const bytes=new Uint32Array(length);
    crypto.getRandomValues(bytes);
    return [...bytes].map(x=>chars[x%chars.length]).join("");
}

function password(length=18){
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    const bytes=new Uint32Array(length);
    crypto.getRandomValues(bytes);
    return [...bytes].map(x=>chars[x%chars.length]).join("");
}

async function sha256(s){
    const data=new TextEncoder().encode(s);
    const hash=await crypto.subtle.digest("SHA-256",data);
    return [...new Uint8Array(hash)]
        .map(x=>x.toString(16).padStart(2,"0"))
        .join("");
}

function uuid(){
    return crypto.randomUUID
        ? crypto.randomUUID()
        : randomString(32);
}

function queryParse(s){
    const q=s.replace(/^[?#]/,"");
    const p=new URLSearchParams(q);
    const obj={};
    for(const [k,v] of p)obj[k]=v;
    return JSON.stringify(obj,null,2);
}

function queryBuild(s){
    const obj=JSON.parse(s);
    return new URLSearchParams(obj).toString();
}

function robots(){
    return `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml`;
}

function sitemap(urls){
    const list=urls
        .split(/\r?\n/)
        .map(x=>x.trim())
        .filter(Boolean);

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${list.map(u=>`  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;
}

function meta(title,description,url){
    return `<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">`;
}

function run(tool,input,options={}){
    const s=text(input);
    const name=text(tool.name).toLowerCase();

    try{

        if(tool.family==="text"){
            if(/duplicate/.test(name))return removeDuplicates(s);
            if(/empty line/.test(name))return removeEmptyLines(s);
            if(/sort/.test(name))return sortLines(s);
            if(/reverse.*word/.test(name))return reverseWords(s);
            if(/reverse/.test(name))return [...s].reverse().join("");
            if(/slug/.test(name))return slug(s);
            if(/upper/.test(name))return s.toUpperCase();
            if(/lower/.test(name))return s.toLowerCase();
            return textStats(s);
        }

        if(tool.family==="json"){
            if(/validate/.test(name))return jsonValidate(s);
            if(/min/.test(name))return jsonMinify(s);
            if(/csv.*json/.test(name))return csvToJson(s);
            if(/json.*csv/.test(name))return jsonToCsv(s);
            return jsonFormat(s);
        }

        if(tool.family==="encoding"){
            if(/base64/.test(name))
                return /decode/.test(name)?base64Decode(s):base64Encode(s);

            if(/url/.test(name))
                return /decode/.test(name)?urlDecode(s):urlEncode(s);

            if(/html.*entit/.test(name))
                return htmlEntities(s);

            return urlEncode(s);
        }

        if(tool.family==="developer"){
            if(/regex/.test(name))
                return regex(s,options.pattern||"");

            if(/html.*min/.test(name))
                return htmlMin(s);

            if(/css.*min/.test(name))
                return cssMin(s);

            if(/javascript|js.*min/.test(name))
                return jsMin(s);

            if(/query.*string|parse.*query/.test(name))
                return queryParse(s);

            if(/build.*query|query.*builder/.test(name))
                return queryBuild(s);

            if(/uuid/.test(name))
                return uuid();

            if(/sha-?256|hash/.test(name))
                return "ASYNC_SHA256";

            return s;
        }

        if(tool.family==="seo"){
            if(/robots/.test(name))
                return robots();

            if(/sitemap/.test(name))
                return sitemap(s);

            if(/meta|open graph|opengraph|canonical|twitter/.test(name))
                return meta(
                    options.title||"AI Nova",
                    options.description||"",
                    options.url||"https://example.com"
                );

            return "SEO TOOL READY\n\n"+s;
        }

        if(tool.family==="color"){
            if(/hex.*rgb/.test(name))
                return hexRgb(s);

            if(/rgb.*hex/.test(name))
                return rgbHex(s);

            return s;
        }

        if(tool.family==="finance"){
            const a=Number(options.amount||options.value||s||0);
            const p=Number(options.percent||0);

            if(/discount/.test(name))return discount(a,p);
            if(/tip/.test(name))return tip(a,p);
            if(/percentage|percent/.test(name))
                return percentage(a,Number(options.total||0));

            return "Amount: "+a;
        }

        if(tool.family==="security"){
            if(/password/.test(name))
                return password(Number(options.length)||18);

            if(/random/.test(name))
                return randomString(Number(options.length)||16);

            if(/uuid/.test(name))
                return uuid();

            if(/sha|hash/.test(name))
                return sha256(s);

            return randomString(24);
        }

        if(tool.family==="generator"){
            if(/gitignore/.test(name))
                return `# AI Nova generated .gitignore
node_modules/
.env
dist/
build/
*.log
.DS_Store`;

            if(/license/.test(name))
                return `MIT License

Copyright (c) ${new Date().getFullYear()} Azzouz Ahmed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files.`;

            if(/readme/.test(name))
                return `# ${options.project||"Project"}

## Description

Describe your project here.

## Installation

Installation instructions.

## Usage

Usage instructions.

## License

MIT`;

            return s;
        }

        if(tool.family==="converter")
            return s;

        return s || "Enter input to run this tool.";

    }catch(e){
        return "Error: "+e.message;
    }
}

return {run,download};

})();
})();
