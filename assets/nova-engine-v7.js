
(function(){
"use strict";

window.AINovaV7={};

const E={};

function text(v){return String(v??"");}

E.trim=v=>text(v).trim();
E.linebreaks=v=>text(v).replace(/\r?\n/g," ");
E.upper=v=>text(v).toUpperCase();
E.lower=v=>text(v).toLowerCase();
E.title=v=>text(v).toLowerCase().replace(/\b\w/g,x=>x.toUpperCase());
E.capitalize=v=>{let s=text(v).trim();return s?s[0].toUpperCase()+s.slice(1):s};
E.reverse=v=>[...text(v)].reverse().join("");
E.sortlines=v=>text(v).split(/\r?\n/).sort((a,b)=>a.localeCompare(b)).join("\n");
E.dedupe=v=>[...new Set(text(v).split(/\r?\n/))].join("\n");
E.clean=v=>text(v).replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();

E.textcount=v=>{
 const s=text(v), words=s.trim()?s.trim().split(/\s+/).length:0;
 return JSON.stringify({words,characters:s.length,charactersNoSpaces:s.replace(/\s/g,"").length,lines:s?s.split(/\r?\n/).length:0},null,2)
};
E.chars=v=>String(text(v).length);
E.lines=v=>String(text(v)?text(v).split(/\r?\n/).length:0);
E.sentences=v=>String((text(v).match(/[.!?]+(?=\s|$)/g)||[]).length);
E.paragraphs=v=>String(text(v).trim()?text(v).trim().split(/\n\s*\n/).length:0);
E.emails=v=>[...new Set(text(v).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[])].join("\n");
E.urls=v=>[...new Set(text(v).match(/https?:\/\/[^\s<>"']+/gi)||[])].join("\n");
E.numbers=v=>(text(v).match(/-?\d+(?:\.\d+)?/g)||[]).join("\n");
E.slug=v=>text(v).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

E.jsonformat=v=>{try{return JSON.stringify(JSON.parse(text(v)),null,2)}catch(e){throw Error("Invalid JSON")}};
E.jsonminify=v=>{try{return JSON.stringify(JSON.parse(text(v)))}catch(e){throw Error("Invalid JSON")}};
E.jsonvalidate=v=>{try{JSON.parse(text(v));return "VALID JSON"}catch(e){return "INVALID JSON: "+e.message}};
E.jsonparse=v=>{try{return JSON.stringify(JSON.parse(text(v)),null,2)}catch(e){throw Error("Invalid JSON")}};
E.jsonstring=v=>{try{return JSON.stringify(JSON.stringify(JSON.parse(text(v))))}catch(e){throw Error("Invalid JSON")}};
E.jsonsort=v=>{
 function sort(x){
  if(Array.isArray(x))return x.map(sort);
  if(x&&typeof x==="object")return Object.keys(x).sort().reduce((o,k)=>(o[k]=sort(x[k]),o),{});
  return x;
 }
 try{return JSON.stringify(sort(JSON.parse(text(v))),null,2)}catch(e){throw Error("Invalid JSON")}
};

E.htmlescape=v=>text(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
E.htmlunescape=v=>{let d=document.createElement("textarea");d.innerHTML=text(v);return d.value};
E.htmltext=v=>{let d=document.createElement("div");d.innerHTML=text(v);return d.textContent||d.innerText||""};
E.texthtml=v=>text(v).split(/\r?\n/).map(x=>"<p>"+E.htmlescape(x)+"</p>").join("\n");
E.htmlmin=v=>text(v).replace(/<!--[\s\S]*?-->/g,"").replace(/>\s+</g,"><").trim();
E.markdownhtml=v=>text(v)
 .replace(/^### (.*)$/gm,"<h3>$1</h3>")
 .replace(/^## (.*)$/gm,"<h2>$1</h2>")
 .replace(/^# (.*)$/gm,"<h1>$1</h1>")
 .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
 .replace(/\*(.*?)\*/g,"<em>$1</em>")
 .replace(/\n/g,"<br>");

E.urlencode=v=>encodeURIComponent(text(v));
E.urldecode=v=>{try{return decodeURIComponent(text(v))}catch(e){throw Error("Invalid URL encoding")}};
E.queryparse=v=>{
 let p=new URLSearchParams(text(v).replace(/^\?/,"")),o={};
 for(const [k,val] of p)o[k]=o[k]===undefined?val:Array.isArray(o[k])?[...o[k],val]:[o[k],val];
 return JSON.stringify(o,null,2)
};
E.querybuild=v=>{
 try{
  let o=JSON.parse(text(v)),p=new URLSearchParams();
  Object.entries(o).forEach(([k,val])=>Array.isArray(val)?val.forEach(x=>p.append(k,x)):p.set(k,val));
  return p.toString()
 }catch(e){throw Error("Enter a JSON object")}
};
E.utm=v=>{
 try{
  let o=JSON.parse(text(v)),u=new URL(o.url||"https://example.com");
  ["source","medium","campaign","term","content"].forEach(k=>{if(o[k])u.searchParams.set("utm_"+k,o[k])});
  return u.toString()
 }catch(e){throw Error("Use JSON: {url,source,medium,campaign,...}")}
};

function parseNum(v,d=0){let n=Number(v);return Number.isFinite(n)?n:d}

E.percentage=v=>{
 let n=parseNum(text(v)),p=parseNum(prompt("Percentage (%)","10"));
 return String(n*p/100)
};
E.percentagechange=v=>{
 let a=parseNum(prompt("Original value","100")),b=parseNum(prompt("New value","120"));
 return String((b-a)/a*100)+"%"
};
E.discount=v=>{
 let p=parseNum(prompt("Original price","100")),d=parseNum(prompt("Discount (%)","10"));
 return JSON.stringify({discount:p*d/100,final:p-p*d/100},null,2)
};
E.tip=v=>{
 let b=parseNum(prompt("Bill","100")),p=parseNum(prompt("Tip (%)","15"));
 return JSON.stringify({tip:b*p/100,total:b+b*p/100},null,2)
};
E.compound=v=>{
 let p=parseNum(prompt("Principal","1000")),r=parseNum(prompt("Annual rate (%)","5"))/100;
 let n=parseNum(prompt("Compounds/year","12")),t=parseNum(prompt("Years","1"));
 let a=p*Math.pow(1+r/n,n*t);
 return JSON.stringify({principal:p,finalAmount:a,interest:a-p},null,2)
};
E.simpleinterest=v=>{
 let p=parseNum(prompt("Principal","1000")),r=parseNum(prompt("Rate (%)","5"))/100,t=parseNum(prompt("Years","1"));
 let i=p*r*t;return JSON.stringify({interest:i,total:p+i},null,2)
};
E.vat=v=>{
 let p=parseNum(prompt("Price","100")),r=parseNum(prompt("VAT (%)","19"));
 return JSON.stringify({vat:p*r/100,total:p+p*r/100},null,2)
};

E.randomnumber=v=>{
 let min=parseNum(prompt("Minimum","1")),max=parseNum(prompt("Maximum","100"));
 return String(Math.floor(Math.random()*(max-min+1))+min)
};
E.randomstring=v=>{
 let n=parseNum(prompt("Length","16")),chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",o="";
 for(let i=0;i<n;i++)o+=chars[Math.floor(Math.random()*chars.length)];
 return o
};
E.password=v=>{
 let n=parseNum(prompt("Length","16")),chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+",o="";
 for(let i=0;i<n;i++)o+=chars[Math.floor(Math.random()*chars.length)];
 return o
};
E.uuid=()=>crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{let r=Math.random()*16|0,v=c==="x"?r:r&3|8;return v.toString(16)});
E.lorem=v=>Array(parseNum(prompt("Paragraphs","3"))).fill("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo nec lorem posuere tincidunt.").join("\n\n");

E.b64encode=v=>btoa(unescape(encodeURIComponent(text(v))));
E.b64decode=v=>{try{return decodeURIComponent(escape(atob(text(v))))}catch(e){throw Error("Invalid Base64")}};
E.unicode=v=>[...text(v)].map(c=>c.codePointAt(0)).join(" ");
E.base=v=>{
 let s=text(v).trim(),base=parseInt(prompt("Input base (2-36)","10"));
 if(!Number.isFinite(base)||base<2||base>36)throw Error("Invalid base");
 let n=parseInt(s,base);
 if(!Number.isFinite(n))throw Error("Invalid number");
 let target=parseInt(prompt("Output base (2-36)","10"));
 return n.toString(target)
};

function hexRgb(h){
 h=text(h).trim().replace("#","");
 if(h.length===3)h=h.split("").map(x=>x+x).join("");
 if(!/^[0-9a-f]{6}$/i.test(h))throw Error("Invalid HEX color");
 return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]
}
E.color=v=>{
 let rgb=hexRgb(v),r=rgb[0]/255,g=rgb[1]/255,b=rgb[2]/255;
 let max=Math.max(r,g,b),min=Math.min(r,g,b),h,s,l=(max+min)/2;
 if(max===min){h=s=0}else{
  let d=max-min;s=l>.5?d/(2-max-min):d/(max+min);
  switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}
  h/=6;
 }
 return JSON.stringify({hex:"#"+rgb.map(x=>x.toString(16).padStart(2,"0")).join(""),rgb,hsl:{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}},null,2)
};

E.timestamp=v=>{
 let s=text(v).trim();
 if(!s)return String(Math.floor(Date.now()/1000));
 if(/^\d+$/.test(s)){let n=Number(s);return new Date(n<1e12?n*1000:n).toISOString()}
 let d=new Date(s);if(isNaN(d))throw Error("Invalid date");
 return String(Math.floor(d.getTime()/1000))
};

E.hash=async v=>{
 const data=new TextEncoder().encode(text(v)),buf=await crypto.subtle.digest("SHA-256",data);
 return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,"0")).join("")
};

E.passwordstrength=v=>{
 let s=text(v),score=0;
 if(s.length>=8)score++;
 if(s.length>=12)score++;
 if(/[a-z]/.test(s)&&/[A-Z]/.test(s))score++;
 if(/\d/.test(s))score++;
 if(/[^A-Za-z0-9]/.test(s))score++;
 return JSON.stringify({score,max:5,strength:["Very Weak","Weak","Fair","Good","Strong","Very Strong"][score]},null,2)
};

E.meta=v=>{
 let s=text(v).trim()||"AI Nova";
 return `<title>${E.htmlescape(s)}</title>\n<meta name="description" content="${E.htmlescape(s)}">`
};
E.canonical=v=>{
 let s=text(v).trim()||location.href;
 return `<link rel="canonical" href="${E.htmlescape(s)}">`
};
E.robots=v=>`User-agent: *\nAllow: /`;
E.schema=v=>`<script type="application/ld+json">\n${text(v)||'{}'}\n</script>`;

E.jsoncsv=v=>{
 let a=JSON.parse(text(v));if(!Array.isArray(a))a=[a];
 if(!a.length)return "";
 let keys=[...new Set(a.flatMap(x=>Object.keys(x)))];
 const q=x=>`"${String(x??"").replace(/"/g,'""')}"`;
 return [keys.map(q).join(","),...a.map(x=>keys.map(k=>q(x[k])).join(","))].join("\n")
};
E.csvjson=v=>{
 let lines=text(v).trim().split(/\r?\n/);if(!lines.length)return "[]";
 let parse=s=>{let a=[],cur="",quote=false;for(let i=0;i<s.length;i++){let c=s[i];if(c==='"'&&s[i+1]==='"'){cur+='"';i++}else if(c==='"')quote=!quote;else if(c===','&&!quote){a.push(cur);cur=""}else cur+=c}a.push(cur);return a};
 let h=parse(lines[0]),out=lines.slice(1).map(l=>{let a=parse(l),o={};h.forEach((k,i)=>o[k]=a[i]??"");return o});
 return JSON.stringify(out,null,2)
};

E.age=v=>{
 let d=new Date(text(v));if(isNaN(d))d=new Date(prompt("Birth date YYYY-MM-DD","2000-01-01"));
 let now=new Date(),age=now.getFullYear()-d.getFullYear();
 if(now<new Date(now.getFullYear(),d.getMonth(),d.getDate()))age--;
 return String(age)+" years"
};

E.datediff=v=>{
 let a=new Date(prompt("Start date YYYY-MM-DD","2026-01-01"));
 let b=new Date(prompt("End date YYYY-MM-DD","2026-09-01"));
 return String(Math.round(Math.abs(b-a)/86400000))+" days"
};

E.lorem=E.lorem;

window.AINovaV7.run=async function(id,value){
 const kind=window.AINovaV7Map[id];
 if(!kind)throw Error("This tool is not implemented locally yet.");
 if(!E[kind])throw Error("Implementation unavailable: "+kind);
 return await E[kind](value);
};

window.AINovaV7.has=id=>!!window.AINovaV7Map[id];

})();
