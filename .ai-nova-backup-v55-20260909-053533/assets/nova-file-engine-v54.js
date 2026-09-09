
(() => {
"use strict";

const API = {};

function downloadBlob(content, filename, type="text/plain;charset=utf-8") {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadJSON(data, filename="ai-nova-result.json") {
    downloadBlob(
        JSON.stringify(data, null, 2),
        filename,
        "application/json;charset=utf-8"
    );
}

function downloadCSV(rows, filename="ai-nova-result.csv") {
    if (!Array.isArray(rows) || !rows.length) {
        downloadBlob("", filename, "text/csv;charset=utf-8");
        return;
    }

    const headers = Array.from(
        new Set(rows.flatMap(row =>
            row && typeof row === "object"
                ? Object.keys(row)
                : []
        ))
    );

    const escape = value => {
        const text = String(value ?? "");
        return '"' + text.replace(/"/g, '""') + '"';
    };

    const lines = [
        headers.map(escape).join(",")
    ];

    for (const row of rows) {
        lines.push(
            headers.map(h => escape(row?.[h])).join(",")
        );
    }

    downloadBlob(
        lines.join("\n"),
        filename,
        "text/csv;charset=utf-8"
    );
}

function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const next = text[i + 1];

        if (c === '"' && quoted && next === '"') {
            cell += '"';
            i++;
        } else if (c === '"') {
            quoted = !quoted;
        } else if (c === "," && !quoted) {
            row.push(cell);
            cell = "";
        } else if ((c === "\n" || c === "\r") && !quoted) {
            if (c === "\r" && next === "\n") i++;
            row.push(cell);
            cell = "";

            if (row.some(v => v !== "")) {
                rows.push(row);
            }

            row = [];
        } else {
            cell += c;
        }
    }

    if (cell !== "" || row.length) {
        row.push(cell);
        rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows[0];

    return rows.slice(1).map(values => {
        const obj = {};
        headers.forEach((h, i) => {
            obj[h || `column_${i + 1}`] = values[i] ?? "";
        });
        return obj;
    });
}

API.readFile = function(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file selected."));
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            resolve({
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
                text: String(reader.result || "")
            });
        };

        reader.onerror = () =>
            reject(new Error("Unable to read file."));

        reader.readAsText(file);
    });
};

API.parse = function(text, filename="") {
    const lower = filename.toLowerCase();

    if (lower.endsWith(".json")) {
        try {
            return {
                format: "json",
                data: JSON.parse(text)
            };
        } catch (e) {
            throw new Error("Invalid JSON: " + e.message);
        }
    }

    if (lower.endsWith(".csv")) {
        return {
            format: "csv",
            data: parseCSV(text)
        };
    }

    return {
        format: "text",
        data: text
    };
};

API.download = downloadBlob;
API.downloadJSON = downloadJSON;
API.downloadCSV = downloadCSV;
API.parseCSV = parseCSV;

window.AINovaFiles = API;

})();
