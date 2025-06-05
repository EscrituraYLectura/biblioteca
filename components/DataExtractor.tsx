"use client";

import React, { useEffect, useState } from "react";

interface Row {
  [key: string]: string | number;
}

export default function DataExtractor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/data.json");
        if (!res.ok) throw new Error("Error al cargar data.json.");
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (rows.length === 0) return <p>No se encontraron datos.</p>;

  const headers = Object.keys(rows[0]);

  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {headers.map((header) => (
              <td key={header}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
