"use client";

import { Bar, Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
} from "chart.js";
import books from "@/public/libros.json";
import authors from "@/public/autores.json";
import { TooltipInternal } from "@/components/Tooltip";

ChartJS.register(BarElement, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

import { useState } from "react";
import stylesStatistics from "@/styles/pages/estadisticas.module.scss";

interface Book {
    Título: string;
    Subido: string;
    Publicación: string;
    Tipo: string;
    Tema?: string;
}

const parseUploadDate = (uploaded: string): Date | null => {
    const match = uploaded.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (!match) return null;
    const [_, year, month, day] = match.map(Number);
    return new Date(year, month, day);
};

const generateDataPerYear = (items: string[]): { years: string[]; quantities: number[] } => {
    const count: Record<string, number> = {};

    items.forEach((year) => {
        if (year && !isNaN(Number(year))) {
            count[year] = (count[year] || 0) + 1;
        }
    });

    const years = Object.keys(count).sort();
    const quantities = years.map((year) => count[year]);

    return { years, quantities };
};

const generatePieData = (items: string[]) => {
    const count: Record<string, number> = {};

    items.forEach((value) => {
        const key = value.trim() || "Sin especificar";
        count[key] = (count[key] || 0) + 1;
    });

    const labels = Object.keys(count);
    const data = Object.values(count);

    const backgroundColors = labels.map((_l, i) =>
        `hsl(${(i * 360) / labels.length}, 70%, 60%)`
    );

    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor: backgroundColors,
                borderWidth: 0,
            },
        ],
    };
};

const generateTopData = (items: string[], topN: number = 10) => {
    const count: Record<string, number> = {};

    items.forEach((value) => {
        value
        .split(",")
        .map((theme) => theme.trim())
        .filter((theme) => theme.length > 0)
        .forEach((theme) => {
            count[theme] = (count[theme] || 0) + 1;
        });
    });

    const orderedEntries = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

    const labels = orderedEntries.map(([theme]) => theme);
    const data = orderedEntries.map(([_, quantity]) => quantity);

    return {
        labels,
        datasets: [
            {
                label: "Cantidad de libros por tema",
                data,
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderRadius: 8,
            },
        ],
    };
};

const createOptions = (tags: string[]) => ({
    responsive: true,
    plugins: {
        legend: { display: false },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                callback: function (_val: any, index: number) {
                    const label = tags[index];
                    if (index === 0 || index === tags.length - 1) {
                        if (label.includes("-")) {
                            const [year, month] = label.split("-");
                            const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
                            return `${monthNames[+month - 1]} ${year}`;
                        } else {
                            return label; // solo año
                        }
                    }
                    return "";
                },
                maxRotation: 0,
                minRotation: 0,
            },
        },
        y: {
            grid: { display: false },
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
});

const themeOptions = {
    responsive: true,
    indexAxis: "y" as const,
    plugins: {
        legend: { display: false },
    },
    scales: {
        x: {
            grid: { display: false },
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
        y: {
            grid: { display: false },
        }
    },
};

export default function GenerateGraphics() {
    // Datos por mes de subida
    const monthlyUploads = books
    .map((book: Book) => {
        const date = parseUploadDate(book.Subido);
        if (!date) return null;
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${date.getFullYear()}-${month}`;
    })
    .filter((a): a is string => !!a);

    // Generar conteo por mes
    const monthCount: Record<string, number> = {};
    monthlyUploads.forEach((month) => {
        monthCount[month] = (monthCount[month] || 0) + 1;
    });

    const orderedMonths = Object.keys(monthCount).sort();
    const monthQuantities = orderedMonths.map((month) => monthCount[month]);

    // Datos por año de publicación
    const yearlyUploads = books
    .map((book: Book) => book.Publicación?.trim())
    .filter((a): a is string => !!a && !isNaN(Number(a)));

    const { years: rawYearlyUploads, quantities: rawUploadQuantities } = generateDataPerYear(yearlyUploads);

    // Filtrar años con al menos 2 libros
    const uploadYears: string[] = [];
    const uploadQuantities: number[] = [];
    
    rawYearlyUploads.forEach((year, idx) => {
        if (rawUploadQuantities[idx] >= 2) {
            uploadYears.push(year);
            uploadQuantities.push(rawUploadQuantities[idx]);
        }
    });
    
    const uploadData = {
        labels: uploadYears,
        datasets: [
            {
                label: "Libros por año de publicación",
                data: uploadQuantities,
                backgroundColor: "rgba(255, 159, 64, 0.6)",
                borderRadius: 8,
            },
        ],
    };

    const tipoData = generatePieData(books.map((book) => book.Tipo || ""));
    const idiomaData = generatePieData(books.map((book) => book.Idioma || ""));
    const originalData = generatePieData(books.map((book) => book.Original || ""));
    const themeData = generateTopData(books.map((book) => book.Tema || ""));
    const sexoAutorData = generatePieData(authors.map((autor) => autor.Sexo || "Sin especificar"));
    const paisAutorData = generatePieData(authors.map((autor) => autor.País || "Sin especificar"));
    const [selectedTipos, setSelectedTipos] = useState<string[]>([]);

    // Obtener todos los tipos únicos
    const uniqueTipos = Array.from(new Set(books.map((book) => book.Tipo?.trim() || "Sin especificar"))).sort();

    const toggleTipo = (type: string) => {
        setSelectedTipos((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    // Construir datasets dinámicos según selección
    const uploadsPerType: Record<string, Record<string, number>> = {};

    books.forEach((book: Book) => {
        const type = book.Tipo?.trim() || "Sin especificar";
        const date = parseUploadDate(book.Subido);
        if (!date) return;
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        if (!uploadsPerType[type]) uploadsPerType[type] = {};
        uploadsPerType[type][month] = (uploadsPerType[type][month] || 0) + 1;
    });

    const monthTags = Object.keys(monthCount).sort();
    const colours = [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 206, 86, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)",
    ];

    const filteredUploadsData = {
        labels: monthTags,
        datasets:
            selectedTipos.length === 0
                ? [
                    {
                        label: "Libros subidos por mes",
                        data: monthQuantities,
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ]
                : selectedTipos.map((type, idx) => {
                    const monthData = monthTags.map((month) => uploadsPerType[type]?.[month] || 0);
                    return {
                        label: `${type}`,
                        data: monthData,
                        borderColor: colours[idx % colours.length],
                        backgroundColor: colours[idx % colours.length].replace("0.8", "0.2"),
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    };
                }),
    };

    return (
        <>
            <main className={stylesStatistics.contenedor_estadisticas}>
                <h2 className={stylesStatistics.titulo_estadisticas}>Estadísticas</h2>
                <div className={stylesStatistics.contenedor_grid_estadisticas}>
                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Libros subidos por año</h2>
                        <Line data={filteredUploadsData} options={createOptions(monthTags)} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {uniqueTipos.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleTipo(type)}
                                        className={`${stylesStatistics.tag} ${selectedTipos.includes(type) ? stylesStatistics.selected : ""}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Libros por año de publicación
                            <TooltipInternal text="ⓘ">No se muestran los años con sólo 1 libro.</TooltipInternal>
                        </h2>
                        <Bar data={uploadData} options={createOptions(uploadYears)} />
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Distribución por tipo</h2>
                        <Pie data={tipoData} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {tipoData.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: tipoData.datasets[0].backgroundColor[i],
                                            color: "white",
                                            border: "none",
                                            cursor: "default",
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Top 10 de temas más frecuentes</h2>
                        <Bar data={themeData} options={themeOptions} />
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Distribución por idioma</h2>
                        <Pie data={idiomaData} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {idiomaData.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: idiomaData.datasets[0].backgroundColor[i],
                                            color: "white",
                                            border: "none",
                                            cursor: "default",
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Distribución por idioma original</h2>
                        <Pie data={originalData} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {originalData.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: originalData.datasets[0].backgroundColor[i],
                                            color: "white",
                                            border: "none",
                                            cursor: "default",
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Distribución por sexo de autores</h2>
                        <Pie data={sexoAutorData} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {sexoAutorData.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: sexoAutorData.datasets[0].backgroundColor[i],
                                            color: "white",
                                            border: "none",
                                            cursor: "default",
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                            
                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Distribución por país de autores</h2>
                        <Pie data={paisAutorData} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {paisAutorData.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: paisAutorData.datasets[0].backgroundColor[i],
                                            color: "white",
                                            border: "none",
                                            cursor: "default",
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}
