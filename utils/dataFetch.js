const fs = require("fs");
const https = require("https");

const SHEET_ID = "1KzBwhtz-t_5i1V9vl6FdALE17SM_5Ep9sKwWG2jN-hM";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

https.get(URL, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
        try {
            const json = JSON.parse(data.substring(47).slice(0, -2));
            const headers = json.table.cols.map(col => col.label || `col_${col.id}`);
            const rows = json.table.rows.map(row => {
                const obj = {};
                row.c.forEach((cell, i) => {
                    obj[headers[i]] = cell?.v ? String(cell.v).normalize("NFC").trim() : "";
                });
                return obj;
            });
          
            fs.writeFileSync("./public/libros.json", JSON.stringify(rows, null, 2));
            console.log("✅ Sheet data saved to libros.json");
        } catch (err) {
            console.error("❌ Failed to parse sheet data:", err);
        }
    });
}).on("error", err => {
    console.error("❌ Request failed:", err);
});
