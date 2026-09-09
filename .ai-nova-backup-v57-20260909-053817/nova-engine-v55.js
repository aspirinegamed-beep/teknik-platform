
(() => {
"use strict";

const IMPLEMENTATIONS = {"word-counter": "text_stats", "character-counter": "text_stats", "line-counter": "text_stats", "text-reverser": "reverse_text", "uppercase": "uppercase", "lowercase": "lowercase", "remove-extra-spaces": "remove_spaces", "remove-duplicate-lines": "duplicate_lines", "sort-lines": "sort_lines", "text-diff": "text_diff", "json-formatter": "json_format", "json-minifier": "json_minify", "json-validator": "json_validate", "base64-encode": "base64_encode", "base64-decode": "base64_decode", "url-encode": "url_encode", "url-decode": "url_decode", "hex-to-rgb": "hex_rgb", "rgb-to-hex": "rgb_hex", "password-generator": "password", "uuid-generator": "uuid", "random-number-generator": "random_number", "days-between-dates": "days_between"};

const API = {};

function text(v) {
    return String(v ?? "");
}

function input(v) {
    return typeof v === "object"
        ? JSON.stringify(v)
        : text(v);
}

/* ---------------- TEXT ---------------- */

API.text_stats = ({input: value = ""}) => {
    const s = text(value);

    const words =
        s.trim()
          ? s.trim().split(/\s+/).length
          : 0;

    return {
        characters: s.length,
        characters_without_spaces:
            s.replace(/\s/g, "").length,
        words,
        lines:
            s ? s.split(/\r?\n/).length : 0
    };
};

API.reverse_text = ({input: value = ""}) =>
    [...text(value)].reverse().join("");

API.uppercase = ({input: value = ""}) =>
    text(value).toUpperCase();

API.lowercase = ({input: value = ""}) =>
    text(value).toLowerCase();

API.remove_spaces = ({input: value = ""}) =>
    text(value).replace(/\s+/g, " ").trim();

API.duplicate_lines = ({input: value = ""}) => {
    const seen = new Set();

    return text(value)
        .split(/\r?\n/)
        .filter(line => {
            if (seen.has(line)) return false;
            seen.add(line);
            return true;
        })
        .join("\n");
};

API.sort_lines = ({input: value = ""}) =>
    text(value)
        .split(/\r?\n/)
        .sort((a,b) => a.localeCompare(b))
        .join("\n");

API.text_diff = ({
    input: a = "",
    input2: b = ""
}) => {

    const A = text(a).split(/\r?\n/);
    const B = text(b).split(/\r?\n/);

    const max = Math.max(A.length, B.length);
    const result = [];

    for (let i = 0; i < max; i++) {

        const left = A[i] ?? "";
        const right = B[i] ?? "";

        if (left === right) {
            result.push("  " + left);
        } else {
            if (left) result.push("- " + left);
            if (right) result.push("+ " + right);
        }
    }

    return result.join("\n");
};

/* ---------------- JSON ---------------- */

API.json_format = ({input: value = ""}) => {
    const data = JSON.parse(text(value));
    return JSON.stringify(data, null, 2);
};

API.json_minify = ({input: value = ""}) => {
    const data = JSON.parse(text(value));
    return JSON.stringify(data);
};

API.json_validate = ({input: value = ""}) => {
    try {
        const data = JSON.parse(text(value));

        return {
            valid: true,
            type: Array.isArray(data)
                ? "array"
                : typeof data
        };

    } catch (e) {

        return {
            valid: false,
            error: e.message
        };
    }
};

/* ---------------- ENCODING ---------------- */

API.base64_encode = ({input: value = ""}) =>
    btoa(unescape(encodeURIComponent(text(value))));

API.base64_decode = ({input: value = ""}) =>
    decodeURIComponent(
        escape(atob(text(value)))
    );

API.url_encode = ({input: value = ""}) =>
    encodeURIComponent(text(value));

API.url_decode = ({input: value = ""}) =>
    decodeURIComponent(text(value));

/* ---------------- COLOR ---------------- */

API.hex_rgb = ({input: value = ""}) => {

    let h = text(value).trim().replace("#","");

    if (h.length === 3) {
        h = h.split("").map(x => x + x).join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(h)) {
        throw new Error("Invalid HEX color.");
    }

    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);

    return {
        hex: "#" + h.toUpperCase(),
        rgb: `rgb(${r}, ${g}, ${b})`,
        r,g,b
    };
};

API.rgb_hex = ({input: value = ""}) => {

    const m = text(value)
        .match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);

    if (!m) {
        throw new Error(
            "Use format: 255, 102, 0"
        );
    }

    const nums = m.slice(1,4).map(Number);

    if (nums.some(n => n < 0 || n > 255)) {
        throw new Error("RGB values must be 0-255.");
    }

    const hex =
        "#" +
        nums.map(n =>
            n.toString(16).padStart(2,"0")
        ).join("").toUpperCase();

    return {
        rgb: `rgb(${nums.join(", ")})`,
        hex
    };
};

/* ---------------- SECURITY ---------------- */

API.password = ({
    length = 18
}) => {

    let n = Number(length) || 18;
    n = Math.min(Math.max(n, 4), 128);

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789!@#$%^&*";

    const bytes =
        new Uint32Array(n);

    crypto.getRandomValues(bytes);

    let result = "";

    for (let i = 0; i < n; i++) {
        result += chars[bytes[i] % chars.length];
    }

    return result;
};

/* ---------------- GENERATORS ---------------- */

API.uuid = () =>
    crypto.randomUUID();

API.random_number = ({
    min = 1,
    max = 100
}) => {

    min = Number(min);
    max = Number(max);

    if (!Number.isFinite(min)) min = 1;
    if (!Number.isFinite(max)) max = 100;

    if (max < min) {
        [min,max] = [max,min];
    }

    const range =
        Math.floor(max - min + 1);

    const bytes =
        new Uint32Array(1);

    crypto.getRandomValues(bytes);

    return (
        Math.floor(
            bytes[0] / 4294967296 * range
        ) + min
    );
};

/* ---------------- DATE ---------------- */

API.days_between = ({
    input: a,
    input2: b
}) => {

    if (!a || !b) {
        throw new Error(
            "Select two dates."
        );
    }

    const A =
        new Date(a + "T00:00:00");

    const B =
        new Date(b + "T00:00:00");

    if (
        Number.isNaN(A.getTime()) ||
        Number.isNaN(B.getTime())
    ) {
        throw new Error("Invalid date.");
    }

    const days =
        Math.round(
            Math.abs(B - A) /
            86400000
        );

    return {
        days,
        from: a,
        to: b
    };
};

API.run = async function(id, values) {

    const fn = IMPLEMENTATIONS[id];

    if (!fn) {
        return {
            available: false,
            status: "Coming Soon",
            message:
                "This tool does not have a verified local implementation yet."
        };
    }

    if (!API[fn]) {
        throw new Error(
            "Implementation missing: " + fn
        );
    }

    return await API[fn](values || {});
};

window.AINovaV55 = API;

})();
