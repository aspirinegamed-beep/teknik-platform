/* AI NOVA V5.9 REAL LOCAL IMPLEMENTATION ENGINE */
(function(){
"use strict";
const IMPLEMENTATIONS = {};

IMPLEMENTATIONS["percentage-calculator"] = function(values){
  const value = Number(values.value ?? values.input ?? 0);
  const total = Number(values.total ?? 100);
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0)
    throw new Error("Enter valid numeric value and total.");
  return ((value / total) * 100).toFixed(2) + "%";
};
IMPLEMENTATIONS["percentage-change-calculator"] = function(values){
  const oldValue = Number(values.oldValue ?? values.input ?? 0);
  const newValue = Number(values.newValue ?? values.value ?? 0);
  if (!Number.isFinite(oldValue) || !Number.isFinite(newValue) || oldValue === 0)
    throw new Error("Enter valid old and new values.");
  const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  return change.toFixed(2) + "%";
};
IMPLEMENTATIONS["discount-calculator"] = function(values){
  const price = Number(values.price ?? values.input ?? 0);
  const discount = Number(values.discount ?? values.value ?? 0);
  if (!Number.isFinite(price) || !Number.isFinite(discount))
    throw new Error("Enter valid price and discount.");
  const saved = price * discount / 100;
  return JSON.stringify({
    original: price,
    discountPercent: discount,
    saved: Number(saved.toFixed(2)),
    final: Number((price - saved).toFixed(2))
  }, null, 2);
};
IMPLEMENTATIONS["tip-calculator"] = function(values){
  const bill = Number(values.bill ?? values.input ?? 0);
  const tip = Number(values.tip ?? values.value ?? 15);
  if (!Number.isFinite(bill) || !Number.isFinite(tip))
    throw new Error("Enter valid bill and tip.");
  const amount = bill * tip / 100;
  return JSON.stringify({
    bill,
    tipPercent: tip,
    tipAmount: Number(amount.toFixed(2)),
    total: Number((bill + amount).toFixed(2))
  }, null, 2);
};
IMPLEMENTATIONS["compound-interest-calculator"] = function(values){
  const principal = Number(values.principal ?? values.input ?? 0);
  const rate = Number(values.rate ?? 0);
  const years = Number(values.years ?? 1);
  const compounds = Number(values.compounds ?? 12);
  if (![principal,rate,years,compounds].every(Number.isFinite))
    throw new Error("Enter valid numeric values.");
  if (compounds <= 0) throw new Error("Compounds must be greater than zero.");
  const amount = principal * Math.pow(1 + rate / 100 / compounds, compounds * years);
  return JSON.stringify({
    principal,
    annualRatePercent: rate,
    years,
    compoundsPerYear: compounds,
    finalAmount: Number(amount.toFixed(2)),
    interest: Number((amount - principal).toFixed(2))
  }, null, 2);
};
IMPLEMENTATIONS["random-number-generator"] = function(values){
  const min = Number(values.min ?? 1);
  const max = Number(values.max ?? values.input ?? 100);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max)
    throw new Error("Invalid range.");
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};
IMPLEMENTATIONS["random-string-generator"] = function(values){
  const length = Math.max(1, Math.min(10000, Number(values.length ?? values.input ?? 16)));
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for(let i=0;i<length;i++) out += chars[bytes[i] % chars.length];
  return out;
};
IMPLEMENTATIONS["password-generator"] = function(values){
  const length = Math.max(8, Math.min(128, Number(values.length ?? values.input ?? 20)));
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  let out = "";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for(let i=0;i<length;i++) out += chars[bytes[i] % chars.length];
  return out;
};
IMPLEMENTATIONS["uuid-generator"] = function(){
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){
    const r = Math.random()*16|0;
    const v = c === "x" ? r : (r&3|8);
    return v.toString(16);
  });
};
IMPLEMENTATIONS["slug-generator"] = function(values){
  return String(values.input ?? values.text ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^\p{L}\p{N}]+/gu,"-")
    .replace(/^-+|-+$/g,"");
};
IMPLEMENTATIONS["trim-text"] = function(values){
  return String(values.input ?? values.text ?? "").trim();
};
IMPLEMENTATIONS["remove-line-breaks"] = function(values){
  return String(values.input ?? values.text ?? "").replace(/\s*\r?\n\s*/g," ");
};
IMPLEMENTATIONS["count-sentences"] = function(values){
  const text = String(values.input ?? values.text ?? "").trim();
  if (!text) return "0";
  return String((text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).length);
};
IMPLEMENTATIONS["count-paragraphs"] = function(values){
  const text = String(values.input ?? values.text ?? "").trim();
  if (!text) return "0";
  return String(text.split(/\n\s*\n/).filter(Boolean).length);
};
IMPLEMENTATIONS["extract-emails"] = function(values){
  const text = String(values.input ?? values.text ?? "");
  return [...new Set(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])].join("\n");
};
IMPLEMENTATIONS["extract-urls"] = function(values){
  const text = String(values.input ?? values.text ?? "");
  return [...new Set(text.match(/https?:\/\/[^\s<>"']+/gi) || [])].join("\n");
};
IMPLEMENTATIONS["extract-numbers"] = function(values){
  const text = String(values.input ?? values.text ?? "");
  return (text.match(/[-+]?\d*\.?\d+/g) || []).join("\n");
};
IMPLEMENTATIONS["json-sort-keys"] = function(values){
  const obj = JSON.parse(String(values.input ?? values.text ?? ""));
  function sort(v){
    if(Array.isArray(v)) return v.map(sort);
    if(v && typeof v === "object"){
      return Object.keys(v).sort().reduce((o,k)=>{o[k]=sort(v[k]);return o;},{});
    }
    return v;
  }
  return JSON.stringify(sort(obj),null,2);
};
IMPLEMENTATIONS["json-to-string"] = function(values){
  const obj = JSON.parse(String(values.input ?? values.text ?? ""));
  return JSON.stringify(obj);
};
IMPLEMENTATIONS["string-to-json"] = function(values){
  return JSON.stringify(JSON.parse(String(values.input ?? values.text ?? "")),null,2);
};
IMPLEMENTATIONS["html-escape"] = function(values){
  return String(values.input ?? values.text ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
};
IMPLEMENTATIONS["html-unescape"] = function(values){
  const el=document.createElement("textarea");
  el.innerHTML=String(values.input ?? values.text ?? "");
  return el.value;
};
IMPLEMENTATIONS["binary-to-decimal"] = function(values){
  const s=String(values.input ?? "").trim();
  if(!/^[01]+$/.test(s)) throw new Error("Invalid binary.");
  return String(parseInt(s,2));
};
IMPLEMENTATIONS["decimal-to-binary"] = function(values){
  const n=Number(values.input ?? values.value);
  if(!Number.isInteger(n) || n<0) throw new Error("Enter a non-negative integer.");
  return n.toString(2);
};
IMPLEMENTATIONS["decimal-to-hex"] = function(values){
  const n=Number(values.input ?? values.value);
  if(!Number.isInteger(n)) throw new Error("Enter an integer.");
  return n.toString(16).toUpperCase();
};
IMPLEMENTATIONS["hex-to-decimal"] = function(values){
  const s=String(values.input ?? "").trim().replace(/^0x/i,"");
  if(!/^[0-9a-f]+$/i.test(s)) throw new Error("Invalid hexadecimal.");
  return String(parseInt(s,16));
};
IMPLEMENTATIONS["hex-to-hsl"] = function(values){
  const hex=String(values.input ?? "").trim().replace("#","");
  if(!/^[0-9a-f]{6}$/i.test(hex)) throw new Error("Use a 6-digit HEX color.");
  let r=parseInt(hex.slice(0,2),16)/255;
  let g=parseInt(hex.slice(2,4),16)/255;
  let b=parseInt(hex.slice(4,6),16)/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h=0,s=0,l=(max+min)/2;
  const d=max-min;
  if(d){
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r:h=((g-b)/d+(g<b?6:0));break;
      case g:h=((b-r)/d+2);break;
      default:h=((r-g)/d+4);
    }
    h*=60;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
};
IMPLEMENTATIONS["hsl-to-hex"] = function(values){
  const m=String(values.input ?? "").match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%\)/i);
  if(!m) throw new Error("Use format hsl(120, 50%, 40%).");
  let h=Number(m[1])/360;
  let s=Number(m[2])/100;
  let l=Number(m[3])/100;
  const hue=p=>{
    const t=(p+ h*6)%6;
    return l-s*l*Math.max(-1,Math.min(Math.min(t-3,5-t),1));
  };
  const r=Math.round(hue(0)*255);
  const g=Math.round(hue(2)*255);
  const b=Math.round(hue(4)*255);
  return "#" + [r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();
};
IMPLEMENTATIONS["lorem-ipsum-generator"] = function(values){
  const count=Math.max(1,Math.min(100,Number(values.count ?? values.input ?? 3)));
  const words=("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua").split(" ");
  let out=[];
  for(let i=0;i<count;i++){
    let p=[];
    for(let j=0;j<35;j++) p.push(words[Math.floor(Math.random()*words.length)]);
    out.push(p.join(" ") + ".");
  }
  return out.join("\n\n");
};
IMPLEMENTATIONS["unix-timestamp"] = function(){
  return String(Math.floor(Date.now()/1000));
};
IMPLEMENTATIONS["timestamp-converter"] = function(values){
  const input=String(values.input ?? "").trim();
  const n=Number(input);
  if(!Number.isFinite(n)) throw new Error("Enter a Unix timestamp.");
  const ms=Math.abs(n)<100000000000 ? n*1000 : n;
  return new Date(ms).toISOString();
};
IMPLEMENTATIONS["query-string-parser"] = function(values){
  const input=String(values.input ?? "").trim();
  const q=input.includes("?") ? input.split("?")[1] : input;
  const params=new URLSearchParams(q);
  const obj={};
  for(const [k,v] of params) obj[k]=v;
  return JSON.stringify(obj,null,2);
};
IMPLEMENTATIONS["query-string-builder"] = function(values){
  const obj=JSON.parse(String(values.input ?? "").trim());
  const p=new URLSearchParams();
  for(const [k,v] of Object.entries(obj)) p.append(k,String(v));
  return p.toString();
};

async function run(id, values){
  const fn=IMPLEMENTATIONS[id];
  if(typeof fn!=="function"){
    return {
      ok:false,
      status:"Coming Soon",
      tool:id,
      message:"This tool is not locally implemented."
    };
  }

  try{
    const result=await fn(values||{});
    return {
      ok:true,
      status:"Available",
      tool:id,
      result
    };
  }catch(error){
    return {
      ok:false,
      status:"Error",
      tool:id,
      message:error && error.message
        ? error.message
        : "Tool execution failed."
    };
  }
}

window.AINovaV59={
  version:"5.9",
  implementations:Object.keys(IMPLEMENTATIONS),
  run
};
})();
