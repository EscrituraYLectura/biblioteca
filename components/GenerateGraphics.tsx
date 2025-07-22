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
    ChartOptions,
} from "chart.js";
import libros from "@/public/libros.json";
import autores from "@/public/autores.json";
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

const parseFechaSubida = (subido: string): Date | null => {
    const match = subido.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (!match) return null;
    const [_, year, month, day] = match.map(Number);
    return new Date(year, month, day);
};

const generarDatosPorAño = (items: string[]): { años: string[]; cantidades: number[] } => {
    const conteo: Record<string, number> = {};

    items.forEach((año) => {
        if (año && !isNaN(Number(año))) {
            conteo[año] = (conteo[año] || 0) + 1;
        }
    });

    const años = Object.keys(conteo).sort();
    const cantidades = años.map((año) => conteo[año]);

    return { años, cantidades };
};

const generarDatosPie = (items: string[]) => {
    const conteo: Record<string, number> = {};

    items.forEach((valor) => {
        const clave = valor.trim() || "Sin especificar";
        conteo[clave] = (conteo[clave] || 0) + 1;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

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

const generarDatosTopTemas = (items: string[], topN: number = 10) => {
    const conteo: Record<string, number> = {};

    items.forEach((valor) => {
        valor
        .split(",")
        .map((tema) => tema.trim())
        .filter((tema) => tema.length > 0)
        .forEach((tema) => {
            conteo[tema] = (conteo[tema] || 0) + 1;
        });
    });

    const entradasOrdenadas = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

    const labels = entradasOrdenadas.map(([tema]) => tema);
    const data = entradasOrdenadas.map(([_, cantidad]) => cantidad);

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

const crearOpciones = (etiquetas: string[]) => ({
    responsive: true,
    plugins: {
        legend: { display: false },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                callback: function (_val: any, index: number) {
                    const label = etiquetas[index];
                    if (index === 0 || index === etiquetas.length - 1) {
                        if (label.includes("-")) {
                            const [año, mes] = label.split("-");
                            const nombresMeses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
                            return `${nombresMeses[+mes - 1]} ${año}`;
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

const opcionesTemas = {
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

export default function GraficoSubidas() {
    // Datos por mes de subida
    const subidasMeses = libros
    .map((book: Book) => {
        const fecha = parseFechaSubida(book.Subido);
        if (!fecha) return null;
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
        return `${fecha.getFullYear()}-${mes}`;
    })
    .filter((a): a is string => !!a);

    // Generar conteo por mes
    const conteoMeses: Record<string, number> = {};
    subidasMeses.forEach((mes) => {
        conteoMeses[mes] = (conteoMeses[mes] || 0) + 1;
    });

    const mesesOrdenados = Object.keys(conteoMeses).sort();
    const cantidadesMeses = mesesOrdenados.map((mes) => conteoMeses[mes]);

    // Datos por año de publicación
    const publicacionesAnios = libros
    .map((book: Book) => book.Publicación?.trim())
    .filter((a): a is string => !!a && !isNaN(Number(a)));

    const { años: añosPublicacionRaw, cantidades: cantidadesPublicacionRaw } = generarDatosPorAño(publicacionesAnios);

    // Filtrar años con al menos 2 libros
    const añosPublicacion: string[] = [];
    const cantidadesPublicacion: number[] = [];
    
    añosPublicacionRaw.forEach((año, idx) => {
        if (cantidadesPublicacionRaw[idx] >= 2) {
            añosPublicacion.push(año);
            cantidadesPublicacion.push(cantidadesPublicacionRaw[idx]);
        }
    });
    
    const datosPublicacion = {
        labels: añosPublicacion,
        datasets: [
            {
                label: "Libros por año de publicación",
                data: cantidadesPublicacion,
                backgroundColor: "rgba(255, 159, 64, 0.6)",
                borderRadius: 8,
            },
        ],
    };

    const datosTipo = generarDatosPie(libros.map((book) => book.Tipo || ""));
    const datosIdioma = generarDatosPie(libros.map((book) => book.Idioma || ""));
    const datosOriginal = generarDatosPie(libros.map((book) => book.Original || ""));
    const datosTemas = generarDatosTopTemas(libros.map((book) => book.Tema || ""));
    const datosSexoAutor = generarDatosPie(autores.map((autor) => autor.Sexo || "Sin especificar"));
    const datosPaisAutor = generarDatosPie(autores.map((autor) => autor.País || "Sin especificar"));
    const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>([]);

    // Obtener todos los tipos únicos
    const tiposUnicos = Array.from(new Set(libros.map((book) => book.Tipo?.trim() || "Sin especificar"))).sort();

    const toggleTipo = (tipo: string) => {
        setTiposSeleccionados((prev) =>
            prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
        );
    };

    // Construir datasets dinámicos según selección
    const subidasPorTipo: Record<string, Record<string, number>> = {};

    libros.forEach((book: Book) => {
        const tipo = book.Tipo?.trim() || "Sin especificar";
        const fecha = parseFechaSubida(book.Subido);
        if (!fecha) return;
        const mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}`;
        if (!subidasPorTipo[tipo]) subidasPorTipo[tipo] = {};
        subidasPorTipo[tipo][mes] = (subidasPorTipo[tipo][mes] || 0) + 1;
    });

    const etiquetasMeses = Object.keys(conteoMeses).sort();
    const colores = [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 206, 86, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)",
    ];

    const datosSubidasFiltrado = {
        labels: etiquetasMeses,
        datasets:
            tiposSeleccionados.length === 0
                ? [
                    {
                        label: "Libros subidos por mes",
                        data: cantidadesMeses,
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ]
                : tiposSeleccionados.map((tipo, idx) => {
                    const dataMeses = etiquetasMeses.map((mes) => subidasPorTipo[tipo]?.[mes] || 0);
                    return {
                        label: `${tipo}`,
                        data: dataMeses,
                        borderColor: colores[idx % colores.length],
                        backgroundColor: colores[idx % colores.length].replace("0.8", "0.2"),
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
                        <Line data={datosSubidasFiltrado} options={crearOpciones(etiquetasMeses)} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {tiposUnicos.map((tipo) => (
                                    <button
                                        key={tipo}
                                        onClick={() => toggleTipo(tipo)}
                                        className={`${stylesStatistics.tag} ${tiposSeleccionados.includes(tipo) ? stylesStatistics.selected : ""}`}
                                    >
                                        {tipo}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Libros por año de publicación
                            <TooltipInternal text="ⓘ">No se muestran los años con sólo 1 libro.</TooltipInternal>
                        </h2>
                        <Bar data={datosPublicacion} options={crearOpciones(añosPublicacion)} />
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Distribución por tipo</h2>
                        <Pie data={datosTipo} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {datosTipo.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: datosTipo.datasets[0].backgroundColor[i],
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
                        <Bar data={datosTemas} options={opcionesTemas} />
                    </div>

                    <div className={stylesStatistics.contenedor_grafico}>
                        <h2>Distribución por idioma</h2>
                        <Pie data={datosIdioma} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {datosIdioma.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: datosIdioma.datasets[0].backgroundColor[i],
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
                        <Pie data={datosOriginal} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {datosOriginal.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: datosOriginal.datasets[0].backgroundColor[i],
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
                        <Pie data={datosSexoAutor} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {datosSexoAutor.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: datosSexoAutor.datasets[0].backgroundColor[i],
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
                        <Pie data={datosPaisAutor} options={{ aspectRatio: 1.5, plugins: { legend: { display: false } } }} />
                        <div className={stylesStatistics.grafico_opciones}>
                            <div className={stylesStatistics.tag_container}>
                                {datosPaisAutor.labels.map((label, i) => (
                                    <span
                                        key={label}
                                        className={stylesStatistics.tag}
                                        style={{
                                            backgroundColor: datosPaisAutor.datasets[0].backgroundColor[i],
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
