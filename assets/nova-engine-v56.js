
(() => {
"use strict";

const EXTRA = {"slug-generator": "slug", "trim-text": "trim", "remove-line-breaks": "remove_line_breaks", "count-sentences": "sentence_count", "count-paragraphs": "paragraph_count", "extract-emails": "extract_emails", "extract-urls": "extract_urls", "extract-numbers": "extract_numbers", "json-sort-keys": "json_sort_keys", "json-to-string": "json_to_string", "string-to-json": "string_to_json", "html-escape": "html_escape", "html-unescape": "html_unescape", "binary-to-decimal": "binary_decimal", "decimal-to-binary": "decimal_binary", "hex-to-decimal": "hex_decimal", "decimal-to-hex": "decimal_hex", "base32-encode": "base32_encode", "percentage": "percentage", "percentage-change": "percentage_change", "discount-calculator": "discount", "tip-calculator": "tip", "compound-interest": "compound_interest", "random-password": "password", "uuid-v4-generator": "uuid", "lorem-ipsum-generator": "lorem", "random-string-generator": "random_string", "hex-to-hsl": "hex_hsl", "hsl-to-hex": "hsl_hex", "timestamp-to-date": "timestamp_date", "date-to-timestamp": "date_timestamp", "query-string-parser": "query_parse", "query-string-builder": "query_build"};

const API = {};

const str = v => String(v ?? "");

API.trim = ({input=""}) =>
    str(input).trim();

API.remove_line_breaks = ({input=""}) =>
    str(input).replace(/[\r\n]+/g, " ");

API.slug = ({input=""}) =>
    str(input)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
        .replace(/^-+|-+$/g, "");

API.sentence_count = ({input=""}) => {
    const s = str(input).trim();
    if (!s) return 0;

    const matches =
        s.match(/[.!?؟]+(?=\s|$)/g);

    return matches ? matches.length : 1;
};

API.paragraph_count = ({input=""}) => {
    const s = str(input).trim();
    if (!s) return 0;

    return s
        .split(/\n\s*\n/)
        .filter(Boolean)
        .length;
};

API.extract_emails = ({input=""}) =>
    str(input).match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    ) || [];

API.extract_urls = ({input=""}) =>
    str(input).match(
        /https?:\/\/[^\s<>"']+/gi
    ) || [];

API.extract_numbers = ({input=""}) =>
    str(input).match(
        /-?\d+(?:[.,]\d+)?/g
    ) || [];

API.json_sort_keys = ({input=""}) => {
    const data = JSON.parse(str(input));

    const sort = value => {
        if (Array.isArray(value))
            return value.map(sort);

        if (
            value &&
            typeof value === "object"
        ) {
            return Object.keys(value)
                .sort()
                .reduce((o,k) => {
                    o[k] = sort(value[k]);
                    return o;
                }, {});
        }

        return value;
    };

    return JSON.stringify(sort(data), null, 2);
};

API.json_to_string = ({input=""}) => {
    const data = JSON.parse(str(input));
    return JSON.stringify(data);
};

API.string_to_json = ({input=""}) =>
    JSON.stringify(
        JSON.parse(str(input)),
        null,
        2
    );

API.html_escape = ({input=""}) =>
    str(input)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");

API.html_unescape = ({input=""}) =>
    str(input)
        .replace(/&lt;/g,"<")
        .replace(/&gt;/g,">")
        .replace(/&quot;/g,'"')
        .replace(/&#39;/g,"'")
        .replace(/&amp;/g,"&");

API.binary_decimal = ({input=""}) => {
    const s = str(input).trim();

    if (!/^[01]+$/.test(s))
        throw new Error("Invalid binary number.");

    return parseInt(s,2);
};

API.decimal_binary = ({input=""}) => {
    const n = Number(str(input).trim());

    if (!Number.isInteger(n) || n < 0)
        throw new Error(
            "Enter a non-negative integer."
        );

    return n.toString(2);
};

API.hex_decimal = ({input=""}) => {
    const s = str(input)
        .trim()
        .replace(/^0x/i,"");

    if (!/^[0-9a-f]+$/i.test(s))
        throw new Error("Invalid hexadecimal number.");

    return parseInt(s,16);
};

API.decimal_hex = ({input=""}) => {
    const n = Number(str(input).trim());

    if (!Number.isInteger(n) || n < 0)
        throw new Error(
            "Enter a non-negative integer."
        );

    return n.toString(16).toUpperCase();
};

API.base32_encode = ({input=""}) => {
    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    const bytes =
        new TextEncoder().encode(str(input));

    let bits = 0;
    let value = 0;
    let out = "";

    for (const byte of bytes) {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            out += alphabet[
                (value >>> (bits - 5)) & 31
            ];
            bits -= 5;
        }
    }

    if (bits > 0) {
        out += alphabet[
            (value << (5 - bits)) & 31
        ];
    }

    while (out.length % 8)
        out += "=";

    return out;
};

API.percentage = ({
    value=0,
    percent=0
}) =>
    Number(value) *
    Number(percent) /
    100;

API.percentage_change = ({
    value=0,
    total=0
}) => {

    const a = Number(value);
    const b = Number(total);

    if (b === 0)
        throw new Error(
            "Total cannot be zero."
        );

    return ((a - b) / b) * 100;
};

API.discount = ({
    value=0,
    percent=0
}) => {

    const price = Number(value);
    const p = Number(percent);

    const saving =
        price * p / 100;

    return {
        original: price,
        discount: saving,
        final: price - saving
    };
};

API.tip = ({
    value=0,
    percent=15
}) => {

    const amount = Number(value);
    const p = Number(percent);

    return {
        tip: amount * p / 100,
        total: amount * (1 + p / 100)
    };
};

API.compound_interest = ({
    value=1000,
    percent=5,
    total=10
}) => {

    const principal = Number(value);
    const rate = Number(percent) / 100;
    const years = Number(total);

    const final =
        principal *
        Math.pow(1 + rate, years);

    return {
        principal,
        rate_percent: Number(percent),
        years,
        final,
        interest: final - principal
    };
};

API.password = ({length=18}) => {

    let n = Number(length) || 18;
    n = Math.min(Math.max(n,4),128);

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789!@#$%^&*";

    const bytes =
        new Uint32Array(n);

    crypto.getRandomValues(bytes);

    let result = "";

    for (let i=0;i<n;i++) {
        result +=
            chars[bytes[i] % chars.length];
    }

    return result;
};

API.uuid = () =>
    crypto.randomUUID();

API.random_string = ({length=16}) => {

    let n = Number(length) || 16;
    n = Math.min(Math.max(n,1),256);

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789";

    const bytes =
        new Uint32Array(n);

    crypto.getRandomValues(bytes);

    return Array.from(
        bytes,
        b => chars[b % chars.length]
    ).join("");
};

API.lorem = ({length=3}) => {

    const paragraphs = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
        "Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
        "Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
        "Aenean lacinia bibendum nulla sed consectetur."
    ];

    let n =
        Math.min(
            Math.max(Number(length) || 3,1),
            20
        );

    return Array.from(
        {length:n},
        (_,i) =>
            paragraphs[i % paragraphs.length]
    ).join("\n\n");
};

function hexRGB(value) {

    let h = str(value)
        .trim()
        .replace("#","");

    if (h.length === 3)
        h = h.split("")
            .map(x => x+x)
            .join("");

    if (!/^[0-9a-f]{6}$/i.test(h))
        throw new Error("Invalid HEX.");

    return [
        parseInt(h.slice(0,2),16),
        parseInt(h.slice(2,4),16),
        parseInt(h.slice(4,6),16)
    ];
}

function rgbHex(r,g,b) {
    return "#" +
        [r,g,b]
        .map(n =>
            Math.round(n)
                .toString(16)
                .padStart(2,"0")
        )
        .join("")
        .toUpperCase();
}

API.hex_hsl = ({input=""}) => {

    let [r,g,b] =
        hexRGB(input)
        .map(v => v / 255);

    const max =
        Math.max(r,g,b);

    const min =
        Math.min(r,g,b);

    const d = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (d !== 0) {

        s =
            d /
            (1 - Math.abs(2*l - 1));

        if (max === r)
            h = 60 * (((g-b)/d) % 6);
        else if (max === g)
            h = 60 * (((b-r)/d) + 2);
        else
            h = 60 * (((r-g)/d) + 4);

        if (h < 0) h += 360;
    }

    return {
        h: Math.round(h),
        s: Math.round(s*100),
        l: Math.round(l*100)
    };
};

API.hsl_hex = ({
    input=""
}) => {

    const m =
        str(input).match(
            /(-?\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)%\s*,?\s*(\d+(?:\.\d+)?)%/
        );

    if (!m)
        throw new Error(
            "Use H,S%,L% format."
        );

    let h = Number(m[1]) / 360;
    let s = Number(m[2]) / 100;
    let l = Number(m[3]) / 100;

    const hue = t => {

        if (t < 0) t += 1;
        if (t > 1) t -= 1;

        if (t < 1/6)
            return l +
                (s * (1-Math.abs(2*l-1)) / 2) *
                6*t;

        if (t < 1/2)
            return l +
                (s * (1-Math.abs(2*l-1)) / 2);

        if (t < 2/3)
            return l +
                (s * (1-Math.abs(2*l-1)) / 2) *
                (4-6*t);

        return l;
    };

    if (s === 0)
        return rgbHex(l*255,l*255,l*255);

    const q =
        l < .5
            ? l*(1+s)
            : l+s-l*s;

    const p =
        2*l-q;

    const f = t => {

        if (t < 0) t += 1;
        if (t > 1) t -= 1;

        if (t < 1/6)
            return p+(q-p)*6*t;

        if (t < 1/2)
            return q;

        if (t < 2/3)
            return p+(q-p)*(2/3-t)*6;

        return p;
    };

    return rgbHex(
        f(h+1/3)*255,
        f(h)*255,
        f(h-1/3)*255
    );
};

API.timestamp_date = ({input=""}) => {

    const n = Number(input);

    if (!Number.isFinite(n))
        throw new Error(
            "Enter a valid Unix timestamp."
        );

    const ms =
        Math.abs(n) < 1e12
            ? n * 1000
            : n;

    return new Date(ms).toISOString();
};

API.date_timestamp = ({input=""}) => {

    const d = new Date(str(input));

    if (Number.isNaN(d.getTime()))
        throw new Error("Invalid date.");

    return Math.floor(
        d.getTime() / 1000
    );
};

API.query_parse = ({input=""}) => {

    let value = str(input).trim();

    if (value.startsWith("?"))
        value = value.slice(1);

    const params =
        new URLSearchParams(value);

    const result = {};

    for (const [k,v] of params.entries()) {

        if (Object.prototype.hasOwnProperty.call(result,k)) {

            if (!Array.isArray(result[k]))
                result[k] = [result[k]];

            result[k].push(v);

        } else {
            result[k] = v;
        }
    }

    return result;
};

API.query_build = ({input=""}) => {

    let data;

    try {
        data = JSON.parse(str(input));
    } catch {
        throw new Error(
            "Enter a JSON object."
        );
    }

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        throw new Error(
            "Input must be a JSON object."
        );
    }

    const params =
        new URLSearchParams();

    for (const [k,v] of Object.entries(data)) {

        if (Array.isArray(v)) {
            v.forEach(x =>
                params.append(k,String(x))
            );
        } else {
            params.set(k,String(v));
        }
    }

    return params.toString();
};

API.run = async function(id, values={}) {

    const fn = EXTRA[id];

    if (!fn || !API[fn]) {

        return {
            available: false,
            status: "Coming Soon",
            message:
                "This tool does not have a verified local implementation yet."
        };
    }

    return await API[fn](values);
};

window.AINovaV56 = API;

})();
