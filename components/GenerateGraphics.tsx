"use client";

import { Bar, Pie, Line } from 'react-chartjs-2';
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
} from 'chart.js';
import data from "@/public/libros.json";

ChartJS.register(BarElement, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Book {
  Título: string;
  Subido: string;
  Publicación: string;
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
    const clave = valor.trim() || 'Sin especificar';
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
      },
    ],
  };
};

const generarDatosTopTemas = (items: string[], topN: number = 10) => {
  const conteo: Record<string, number> = {};

  items.forEach((valor) => {
    valor
      .split(',')
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
        label: 'Cantidad de libros por tema',
        data,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderRadius: 8,
      },
    ],
  };
};

const crearOpciones = (años: string[]) => ({
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: {
        callback: function (_val: any, index: number) {
          if (index === 0 || index === años.length - 1) {
            return años[index];
          }
          return '';
        },
      },
    },
    y: {
      beginAtZero: true,
      stepSize: 1,
    },
  },
});

const opcionesTemas = {
  responsive: true,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};

export default function GraficoSubidas() {
  // Datos por año de subida
  const subidasAnios = data
    .map((book: Book) => parseFechaSubida(book.Subido)?.getFullYear().toString() || null)
    .filter((a): a is string => !!a);

  const { años: añosSubidas, cantidades: cantidadesSubidas } = generarDatosPorAño(subidasAnios);

  const datosSubidas = {
    labels: añosSubidas,
    datasets: [
      {
        label: 'Libros subidos por año',
        data: cantidadesSubidas,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Datos por año de publicación
  const publicacionesAnios = data
    .map((book: Book) => book.Publicación?.trim())
    .filter((a): a is string => !!a && !isNaN(Number(a)));

  const { años: añosPublicacion, cantidades: cantidadesPublicacion } =
    generarDatosPorAño(publicacionesAnios);

  const datosPublicacion = {
    labels: añosPublicacion,
    datasets: [
      {
        label: 'Libros por año de publicación',
        data: cantidadesPublicacion,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderRadius: 8,
      },
    ],
  };

    const datosTipo = generarDatosPie(data.map((book) => book.Tipo || ''));
    const datosIdioma = generarDatosPie(data.map((book) => book.Idioma || ''));
    const datosOriginal = generarDatosPie(data.map((book) => book.Original || ''));
    const datosTemas = generarDatosTopTemas(data.map((book) => book.Tema || ''));

  return (
    <>
        <main className="contenedor-estadisticas">
            <div className="contenedor-grafico">
                <h2>Libros subidos por año</h2>
                <Line data={datosSubidas} options={crearOpciones(añosSubidas)} />
            </div>

            <div className="contenedor-grafico">
                <h2>Libros por año de publicación</h2>
                <Bar data={datosPublicacion} options={crearOpciones(añosPublicacion)} />
            </div>

            <div className="contenedor-grafico">
                <h2>Distribución por tipo</h2>
                <Pie data={datosTipo} />
            </div>

            <div className="contenedor-grafico">
                <h2>Top 10 de temas más frecuentes</h2>
                <Bar data={datosTemas} options={opcionesTemas} />
            </div>

            <div className="contenedor-grafico">
                <h2>Distribución por idioma</h2>
                <Pie data={datosIdioma} />
            </div>

            <div className="contenedor-grafico">
                <h2>Distribución por idioma original</h2>
                <Pie data={datosOriginal} />
            </div>
        </main>
    </>
  );
}
