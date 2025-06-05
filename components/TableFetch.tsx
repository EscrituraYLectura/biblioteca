"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import data from "@/public/data.json";

interface Book {
    Título: string;
    Autor: string;
    Publicación: string;
    Tipo: string;
    Tema: string;
    Idioma: string;
    Original: string;
    Saga: string;
    Otros: string;
    Subido: string;
    Formato: string;
    Editado: boolean;
    Enlace: string;
}

interface Filters {
    Título: string;
    Autor: string;
    Publicación: string;
    Tipo: string;
    Tema: string[];
    Idioma: string;
    Original: string;
    Saga: string;
}

const defaultFilters: Filters = {
    Título: "",
    Autor: "",
    Publicación: "",
    Tipo: "",
    Tema: [],
    Idioma: "",
    Original: "",
    Saga: "",
};

function parseQuery(searchParams: URLSearchParams): Filters {
    const parsedFilters = { ...defaultFilters };
    for (const key of Object.keys(parsedFilters) as (keyof Filters)[]) {
        const value = searchParams.get(key);
        if (value) {
            if (key === "Tema") {
                parsedFilters[key] = value.split(",").map((v) => v.trim());
            } else {
            parsedFilters[key] = value as Filters[typeof key];
            }
        }
    }
    return parsedFilters;
}

function serializeFilters(filters: Filters): string {
    const params = new URLSearchParams();
    for (const key of Object.keys(filters) as (keyof Filters)[]) {
        const value = filters[key];
        if (key === "Tema" && value.length > 0) {
            params.set(key, Array.isArray(value) ? value.join(",") : value);
        } else if (typeof value === "string" && value.trim() !== "") {
            params.set(key, value);
        }
    }
    return params.toString();
}

export default function TableFetch() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [filters, setFilters] = useState<Filters>(() =>
        parseQuery(searchParams)
    );

    const temasSet = useMemo(() => {
        const set = new Set<string>();
        data.forEach((book: Book) => {
            book.Tema.split(",").forEach((tema) => {
                const trimmed = tema.trim();
                if (trimmed) set.add(trimmed);
            });
        });
        return Array.from(set).sort();
    }, []);

    const opcionesSet = (field: keyof Book): string[] => {
        const set = new Set<string>();
        data.forEach((book: Book) => {
            const value = book[field];
            if (typeof value === "string") {
                set.add(value);
            }
        });
        return Array.from(set).sort();
    };

    const updateFilter = (key: keyof Filters, value: string | string[]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        const query = serializeFilters(newFilters);
        router.push("?" + query);
    };

    const filteredData = useMemo(() => {
        return data.filter((book: Book) => {
            return (
                (!filters.Título || book.Título.toLowerCase().includes(filters.Título.toLowerCase())) &&
                (!filters.Autor || book.Autor.toLowerCase().includes(filters.Autor.toLowerCase())) &&
                (!filters.Publicación || book.Publicación.includes(filters.Publicación)) &&
                (!filters.Tipo || book.Tipo === filters.Tipo) &&
                (filters.Tema.length === 0 || filters.Tema.every((t) => book.Tema.split(",").map(s => s.trim()).includes(t))) &&
                (!filters.Idioma || book.Idioma === filters.Idioma) &&
                (!filters.Original || book.Original === filters.Original) &&
                (!filters.Saga || book.Saga.toLowerCase().includes(filters.Saga.toLowerCase()))
            );
        });
    }, [filters]);

    return (
        <div className="container">
            <aside className="sidebar">
                <div className="introduction">
                    <p>Herramienta de búsqueda de la Biblioteca de Escritura y Lectura.</p>
                    <a href="https://github.com/EscrituraYLectura/biblioteca" target="_blank">Sitio web de código abierto.</a>
                </div>

                <button
                    id="clear-filters-button"
                    type="button"
                    onClick={() => {
                    setFilters({
                        Título: "",
                        Autor: "",
                        Publicación: "",
                        Tipo: "",
                        Tema: [],
                        Idioma: "",
                        Original: "",
                        Saga: "",
                        });
                    router.push("/");
                    }}
                >
                    Borrar filtros
                </button>

                <label htmlFor="título">Título:</label>
                <input
                id="título"
                type="text"
                value={filters.Título}
                onChange={(e) => updateFilter("Título", e.target.value)}
                />

                <label htmlFor="autor">Autor:</label>
                <input
                id="autor"
                type="text"
                value={filters.Autor}
                onChange={(e) => updateFilter("Autor", e.target.value)}
                />

                <label htmlFor="publicación">Año de publicación:
                    <span className="information" title="Puedes escribir tres o dos dígitos para buscar por década o por siglo. Ej.: '198' para la década de 1980, '20' para el siglo XXI."> ⓘ</span>
                </label>
                <input
                id="publicación"
                type="text"
                value={filters.Publicación}
                onChange={(e) => updateFilter("Publicación", e.target.value)}
                />

                <label htmlFor="tipo">Tipo:</label>
                <select
                id="tipo"
                value={filters.Tipo}
                onChange={(e) => updateFilter("Tipo", e.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    {opcionesSet("Tipo").map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>

                <label htmlFor="temas">Temas:</label>
                <div id="temas" className="tag-container">
                {Array.from(temasSet).map((opt) => {
                    const selected = filters.Tema.includes(opt);
                    return (
                        <button
                        key={opt}
                        type="button"
                        className={`tag ${selected ? "selected" : ""}`}
                        onClick={() => {
                        const newTema = selected
                            ? filters.Tema.filter((t) => t !== opt)
                            : [...filters.Tema, opt];
                        updateFilter("Tema", newTema);
                        }}
                        >
                            {opt}
                        </button>
                    );
                })}
                </div>

                <label htmlFor="idiomas">Idioma:</label>
                <select
                id="idioma"
                value={filters.Idioma}
                onChange={(e) => updateFilter("Idioma", e.target.value)}
                >
                <option value="">Todos los idiomas</option>
                {opcionesSet("Idioma").map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>

                <label htmlFor="original">Idioma original:</label>
                <select
                id="original"
                value={filters.Original}
                onChange={(e) => updateFilter("Original", e.target.value)}
                >
                <option value="">Todos los idiomas</option>
                {opcionesSet("Original").map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>

                <label htmlFor="saga">Saga:</label>
                <input
                id="saga"
                type="text"
                value={filters.Saga}
                onChange={(e) => updateFilter("Saga", e.target.value)}
                />
            </aside>

            <main className="results">
                <p id="numero-resultados">
                    {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>Título<span className="information" title="Los números entre paréntesis indican el orden dentro de la saga."> ⓘ</span></th>
                            <th>Autor(es)</th>
                            <th>Publicación</th>
                            <th>Tipo</th>
                            <th>Tema(s)</th>
                            <th>Idioma</th>
                            <th>Original</th>
                            <th>Saga</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((book, index) => (
                        <tr key={index}>
                            <td><a href={book.Enlace !== "" ? book.Enlace : undefined} target="_blank">{book.Título}</a></td>
                            <td>{book.Autor}</td>
                            <td>{book.Publicación}</td>
                            <td>{book.Tipo}</td>
                            <td>{book.Tema}</td>
                            <td>{book.Idioma}</td>
                            <td>{book.Original}</td>
                            <td>{book.Saga}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}
