"use client";

import React, { useEffect, useState } from 'react';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1KzBwhtz-t_5i1V9vl6FdALE17SM_5Ep9sKwWG2jN-hM/gviz/tq?tqx=out:json';

export default function GoogleSheetDatabase() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(SHEET_URL);
        const text = await res.text();

        // Remove JSONP wrapper
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows.map((row: any) =>
          row.c.map((cell: any) => (cell ? cell.v : ''))
        );

        setData(rows);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch sheet data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading sheet data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <table border={1} cellPadding={8}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
