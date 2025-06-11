"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";
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
    Editado: string;
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
    Editado: string;
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
    Editado: "",
};

function parseQuery(searchParams: URLSearchParams): Filters {
    const parsedFilters = { ...defaultFilters };
    for (const key of Object.keys(parsedFilters) as (keyof Filters)[]) {
        const value = searchParams.get(key);
        if (value) {
            if (key === "Tema") {
                parsedFilters[key] = value.split(",").map((v) => v.trim());
            } else {
            parsedFilters[key] = value ?? "";
            }
        }
    }
    return parsedFilters;
}

function serializeFilters(filters: Filters): string {
    const params = new URLSearchParams();
    for (const key of Object.keys(filters) as (keyof Filters)[]) {
        const value = filters[key];
        if (key === "Tema" && Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(","));
        } else if (typeof value === "string" && value.trim() !== "") {
            params.set(key, value);
        }
    }
    return params.toString();
}

export default function TableFetch() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialFilters = useMemo(() => parseQuery(searchParams), []);
    const [filters, setFilters] = useState<Filters>(initialFilters);

    useEffect(() => {
        const query = serializeFilters(filters);
        const current = serializeFilters(parseQuery(new URLSearchParams(window.location.search)));

        if (query === current) return;

        const timeout = setTimeout(() => {
            router.replace("?" + query, { scroll: false });
        }, 1000);

        return () => clearTimeout(timeout);
    }, [filters]);


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
        const set = new Map<string, string>();
        data.forEach((book: Book) => {
            const value = book[field];
            if (typeof value === "string") {
                const normalized = value.normalize("NFC").trim().toLowerCase();

                if (!set.has(normalized)) {
                    set.set(normalized, value.trim());
                }
            }
        });

        return Array.from(set.values()).sort();
    };

    const updateFilter = (key: keyof Filters, value: string | string[]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
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
                (!filters.Saga || book.Saga.toLowerCase().includes(filters.Saga.toLowerCase())) &&
                (!filters.Editado || book.Editado === filters.Editado)
            );
        });
    }, [filters]);

    type SortableKeys = "Título" | "Autor" | "Publicación" | "Tipo";
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: "asc" | "desc" } | null>(null);

    const sortedData = useMemo(() => {
        const data = [...filteredData];
        if (sortConfig !== null) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key] ?? "";
                const bValue = b[sortConfig.key] ?? "";
                return sortConfig.direction === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
            });
      }
      return data;
    }, [filteredData, sortConfig]);

    const toggleSort = (key: SortableKeys) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return {
                key,
                direction: prev.direction === "asc" ? "desc" : "asc",
                };
            } else {
                return {
                key,
                direction: "asc",
                };
            }
        });
    };

    return (
        <>
            <aside className="sidebar">
                <h2 className="pagina-subtitulo">Buscador</h2>

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
                        Editado: "",
                        });
                    router.replace("/buscador");
                    setSortConfig({ key: "Título", direction: "asc" });
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
                    <Tooltip text="ⓘ">Puedes escribir tres dígitos para buscar por década. Ej.: '198' para la década de 1980.</Tooltip>
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

                <label htmlFor="idioma">Idioma:</label>
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
                <option value="">Todos los idiomas originales</option>
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
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Título
                                    <span onClick={() => toggleSort("Título")} className="sort-arrow">
                                    {sortConfig?.key === "Título"
                                        ? sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "▼"}
                                    </span>
                                </th>
                                <th>
                                    Autor(es)
                                    <span onClick={() => toggleSort("Autor")} className="sort-arrow">
                                    {sortConfig?.key === "Autor"
                                        ? sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "▼"}
                                    </span>
                                </th>
                                <th>
                                    Año
                                    <span onClick={() => toggleSort("Publicación")} className="sort-arrow">
                                    {sortConfig?.key === "Publicación"
                                        ? sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "▼"}
                                    </span>
                                </th>
                                <th>
                                    Tipo
                                    <span onClick={() => toggleSort("Tipo")} className="sort-arrow">
                                    {sortConfig?.key === "Tipo"
                                        ? sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "▼"}
                                    </span>
                                </th>
                                <th>Tema(s)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((book, index) => (
                            <tr key={index} className={book.Editado ? "libro-editado" : undefined}>
                                <td>
                                    {book.Enlace !== "" ? <a href={book.Enlace} target="_blank">{book.Título}</a> : book.Título}
                                    {book.Otros !== "" ? <Tooltip text="✚">Otras ediciones: {book.Otros}</Tooltip> : undefined}
                                </td>
                                <td>{book.Autor}</td>
                                <td>{book.Publicación}</td>
                                <td>{book.Tipo}</td>
                                <td>{book.Tema}</td>
                                <td><button className="report-button" type="button" title="¿Hay información errada? ¿Falta información? ¡Haz clic aquí para reportar!">✖</button></td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="barra-inferior">
                    <p id="numero-resultados">
                        {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}
                        <Tooltip text="ⓘ">
                            <span>
                                - Los números entre paréntesis indican el orden dentro de la saga.<br/>
                                - Párate sobre <span className="bs-1">✚</span> para ver otras ediciones del mismo libro.<br/>
                                - Los libros con <span className={`bs-2 ${filters.Editado === "true" ? "editado-activado" : ""}`} onClick={() => updateFilter("Editado", filters.Editado === "true" ? "" : "true")}>fondo amarillo</span> son ediciones hechas por EyL.<br/>
                                - Haz clic en <span className="bs-3">✖</span> para reportar información errada o faltante.
                            </span>
                        </Tooltip>
                    </p>
                    <p>Puedes ayudar al servidor <a href="https://discord.com/channels/403377475947855882/1290810391089123388" target="_blank">donando los libros que tengas</a>. ¡Te lo agradecemos muchísimo!</p>
                </div>
            </main>
        </>
    );
}
