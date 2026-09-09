
(() => {
"use strict";

window.AINovaV5 = (() => {

const esc = (v) => String(v ?? "");

function download(name, content, type="text/plain") {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
}

function jsonFormat(input) {
    const obj = JSON.parse(input);
    return JSON.stringify(obj, null, 2);
}

function jsonMinify(input) {
    const obj = JSON.parse(input);
    return JSON.stringify(obj);
}

function wordCount(input) {
    const text = esc(input);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split(/\r?\n/).length : 0;
    return `Words: ${words}\nCharacters: ${chars}\nLines: ${lines}`;
}

function textCase(input, mode) {
    if (mode === "upper") return input.toUpperCase();
    if (mode === "lower") return input.toLowerCase();
    if (mode === "title")
        return input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    if (mode === "sentence")
        return input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    return input;
}

function base64Encode(input) {
    return btoa(unescape(encodeURIComponent(input)));
}

function base64Decode(input) {
    return decodeURIComponent(escape(atob(input)));
}

function urlEncode(input) {
    return encodeURIComponent(input);
}

function urlDecode(input) {
    return decodeURIComponent(input);
}

function slugify(input) {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-+|-+$/g,"");
}

function removeWhitespace(input) {
    return input.replace(/\s+/g," ").trim();
}

function sortLines(input) {
    return input.split(/\r?\n/).sort((a,b)=>a.localeCompare(b)).join("\n");
}

function reverseText(input) {
    return [...input].reverse().join("");
}

function regexTest(input, pattern, flags="g") {
    try {
        const re = new RegExp(pattern, flags);
        const matches = input.match(re);
        return matches
            ? `Matches: ${matches.length}\n\n${matches.join("\n")}`
            : "No matches.";
    } catch(e) {
        return "Regex error: " + e.message;
    }
}

function htmlMinify(input) {
    return input
        .replace(/<!--[\s\S]*?-->/g,"")
        .replace(/\s{2,}/g," ")
        .replace(/>\s+</g,"><")
        .trim();
}

function cssMinify(input) {
    return input
        .replace(/\/\*[\s\S]*?\*\//g,"")
        .replace(/\s+/g," ")
        .replace(/\s*([{}:;,])\s*/g,"$1")
        .trim();
}

function jsMinify(input) {
    return input
        .replace(/\/\*[\s\S]*?\*\//g,"")
        .replace(/(^|[^:])\/\/.*$/gm,"$1")
        .replace(/\s+/g," ")
        .trim();
}

function hexToRgb(hex) {
    let h = hex.trim().replace("#","");
    if (h.length === 3) h = h.split("").map(x=>x+x).join("");
    if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error("Invalid HEX color");
    const n = parseInt(h,16);
    return `rgb(${n>>16}, ${(n>>8)&255}, ${n&255})`;
}

function rgbToHex(input) {
    const m = input.match(/\d+/g);
    if (!m || m.length < 3) throw new Error("Use RGB like 255, 0, 128");
    return "#" + m.slice(0,3)
        .map(x=>Math.max(0,Math.min(255,+x)).toString(16).padStart(2,"0"))
        .join("");
}

function percentage(part,total) {
    if (!total) throw new Error("Total cannot be zero");
    return ((part/total)*100).toFixed(2) + "%";
}

function discount(price, percent) {
    const saved = price * percent / 100;
    return `Original: ${price}\nDiscount: ${saved.toFixed(2)}\nFinal: ${(price-saved).toFixed(2)}`;
}

function tip(bill, percent) {
    const amount = bill * percent / 100;
    return `Tip: ${amount.toFixed(2)}\nTotal: ${(bill+amount).toFixed(2)}`;
}

function password(length=16) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    return [...bytes].map(n=>chars[n % chars.length]).join("");
}

function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    a[6]=(a[6]&15)|64;
    a[8]=(a[8]&63)|128;
    return [...a].map((b,i)=>
        ([4,6,8,10].includes(i)?"-":"")+
        b.toString(16).padStart(2,"0")
    ).join("");
}

function csvToJson(input) {
    const lines = input.trim().split(/\r?\n/);
    if (!lines.length) return "[]";
    const headers = lines[0].split(",").map(x=>x.trim());
    const rows = lines.slice(1).map(line=>{
        const vals = line.split(",");
        const obj={};
        headers.forEach((h,i)=>obj[h]=(vals[i]??"").trim());
        return obj;
    });
    return JSON.stringify(rows,null,2);
}

function run(tool, input, options={}) {
    const s = esc(input);
    const n = Number(options.number ?? options.value ?? 0);
    const p = Number(options.percent ?? 0);

    try {
        switch(tool.family) {

            case "text":
                if (/word|character|line count/i.test(tool.name))
                    return wordCount(s);
                if (/upper/i.test(tool.name))
                    return textCase(s,"upper");
                if (/lower/i.test(tool.name))
                    return textCase(s,"lower");
                if (/title/i.test(tool.name))
                    return textCase(s,"title");
                if (/sentence/i.test(tool.name))
                    return textCase(s,"sentence");
                if (/slug/i.test(tool.name))
                    return slugify(s);
                if (/whitespace|spaces|clean/i.test(tool.name))
                    return removeWhitespace(s);
                if (/sort/i.test(tool.name))
                    return sortLines(s);
                if (/reverse/i.test(tool.name))
                    return reverseText(s);
                return wordCount(s);

            case "json":
                if (/csv.*json/i.test(tool.name))
                    return csvToJson(s);
                if (/min/i.test(tool.name))
                    return jsonMinify(s);
                return jsonFormat(s);

            case "encoding":
                if (/base64/i.test(tool.name))
                    return /decode/i.test(tool.name) ? base64Decode(s) : base64Encode(s);
                if (/url/i.test(tool.name))
                    return /decode/i.test(tool.name) ? urlDecode(s) : urlEncode(s);
                return urlEncode(s);

            case "developer":
                if (/regex/i.test(tool.name))
                    return regexTest(s, options.pattern || "");
                if (/html.*min/i.test(tool.name))
                    return htmlMinify(s);
                if (/css.*min/i.test(tool.name))
                    return cssMinify(s);
                if (/javascript|js.*min/i.test(tool.name))
                    return jsMinify(s);
                if (/uuid/i.test(tool.name))
                    return uuid();
                return s;

            case "color":
                if (/hex.*rgb|hex to rgb/i.test(tool.name))
                    return hexToRgb(s);
                if (/rgb.*hex|rgb to hex/i.test(tool.name))
                    return rgbToHex(s);
                return s;

            case "finance":
                if (/discount/i.test(tool.name))
                    return discount(n,p);
                if (/tip/i.test(tool.name))
                    return tip(n,p);
                if (/percentage|percent/i.test(tool.name))
                    return percentage(n,Number(options.total||0));
                return s;

            case "security":
                if (/password/i.test(tool.name))
                    return password(Number(options.length)||16);
                if (/random.*string/i.test(tool.name))
                    return password(Number(options.length)||16);
                return s;

            default:
                return s || "Enter input to run this tool.";
        }
    } catch(e) {
        return "Error: " + e.message;
    }
}

return {run,download};

})();

})();
