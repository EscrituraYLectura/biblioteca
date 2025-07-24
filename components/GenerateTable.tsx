"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TooltipInternal } from "@/components/Tooltip";
import Popup from "@/components/Popup"
import books from "@/public/libros.json";
import authors from "@/public/autores.json";
import reports from "@/public/reportes.json";
import stylesSearcher from "@/styles/pages/buscador.module.scss"

const reported: string[] = reports as string[];

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
    ID: string;
}

interface Filters {
    título: string;
    autor: string;
    publicación: string;
    tipo: string;
    temas: string[];
    idioma: string;
    original: string;
    saga: string;
    editado: string;
    sexo: string;
    país: string;
}

const defaultFilters: Filters = {
    título: "",
    autor: "",
    publicación: "",
    tipo: "",
    temas: [],
    idioma: "",
    original: "",
    saga: "",
    editado: "",
    sexo: "",
    país: "",
};

function parseQuery(searchParams: URLSearchParams): Filters {
    const parsedFilters = { ...defaultFilters };
    for (const key of Object.keys(parsedFilters) as (keyof Filters)[]) {
        const value = searchParams.get(key);
        if (value) {
            if (key === "temas") {
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
        if (key === "temas" && Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(","));
        } else if (typeof value === "string" && value.trim() !== "") {
            params.set(key, value);
        }
    }
    return params.toString();
}

export default function GenerateTable() {
    const [activePopup, setActivePopup] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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

    const themesSet = useMemo(() => {
        const set = new Set<string>();
        books.forEach((book: Book) => {
            book.Tema.split(",").forEach((tema) => {
                const trimmed = tema.trim();
                if (trimmed) set.add(trimmed);
            });
        });
        return Array.from(set).sort();
    }, []);

    const optionsSet = (field: keyof Book): string[] => {
        const set = new Map<string, string>();
        books.forEach((book: Book) => {
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
        return books.filter((book: Book) => {
            // Filtros por campos del libro
            const filtersPerBook =
                (!filters.título || book.Título.toLowerCase().includes(filters.título.toLowerCase())) &&
                (!filters.autor || book.Autor.toLowerCase().includes(filters.autor.toLowerCase())) &&
                (!filters.publicación || book.Publicación.includes(filters.publicación)) &&
                (!filters.tipo || book.Tipo === filters.tipo) &&
                (filters.temas.length === 0 || filters.temas.every((t) => book.Tema.split(",").map(s => s.trim()).includes(t))) &&
                (!filters.idioma || book.Idioma === filters.idioma) &&
                (!filters.original || book.Original === filters.original) &&
                (!filters.saga || book.Saga.toLowerCase().includes(filters.saga.toLowerCase())) &&
                (!filters.editado || book.Editado === filters.editado);

            if (!filtersPerBook) return false;

            // Filtros por sexo del autor y país del autor (usando autores.json)
            const bookAuthors = book.Autor.split(",").map((name) => name.trim());
            const authorData = bookAuthors
                .map((name) =>
                    authors.find((a) => a.Nombre.toLowerCase() === name.toLowerCase())
                )
                .filter(Boolean);

            if (filters.sexo && !authorData.some((a) => a?.Sexo === filters.sexo)) {
                return false;
            }

            if (filters.país && !authorData.some((a) => a?.País === filters.país)) {
                return false;
            }

            return true;
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

    const typeStyles = {
        "estilo_tipo_morado": ["Novela", "Cuento", "Poesía", "Teatro", "Diálogo"],
        "estilo_tipo_azul": ["Ensayo", "Consulta", "Biografía", "Diario"],
        "estilo_tipo_verde": ["Manga", "Cómic", "Arte"],
    };

    const sex = useMemo(() => {
        const set = new Set(authors.map((a) => a.Sexo).filter(Boolean));
        return Array.from(set);
    }, []);

    const countries = useMemo(() => {
        const set = new Set(authors.map((a) => a.País).filter(Boolean));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, []);

    return (
        <>
            <aside className={stylesSearcher.sidebar}>
                <h2 className={stylesSearcher.pagina_subtitulo}>Buscador</h2>

                <button
                    id={stylesSearcher.clear_filters_button}
                    type="button"
                    onClick={() => {
                    setFilters({
                        título: "",
                        autor: "",
                        publicación: "",
                        tipo: "",
                        temas: [],
                        idioma: "",
                        original: "",
                        saga: "",
                        editado: "",
                        sexo: "",
                        país: "",
                        });
                    router.replace("/buscador");
                    setSortConfig({ key: "Título", direction: "asc" });
                    }}
                >
                    Borrar filtros
                </button>

                <hr className={stylesSearcher.barra_separadora}/>

                <label htmlFor="título">Título:</label>
                <input
                id="título"
                type="text"
                value={filters.título}
                onChange={(e) => updateFilter("título", e.target.value)}
                />

                <label htmlFor="autor">Autor:</label>
                <input
                id="autor"
                type="text"
                value={filters.autor}
                onChange={(e) => updateFilter("autor", e.target.value)}
                />

                <label htmlFor="publicación">Año de publicación:
                    <TooltipInternal text="ⓘ">Puedes escribir tres dígitos para buscar por década. Ej.: "198" para la década de 1980.</TooltipInternal>
                </label>
                <input
                id="publicación"
                type="text"
                value={filters.publicación}
                onChange={(e) => updateFilter("publicación", e.target.value)}
                />

                <label htmlFor="tipo">Tipo:</label>
                <select
                id="tipo"
                value={filters.tipo}
                onChange={(e) => updateFilter("tipo", e.target.value)}
                >
                <option value="">Todos los tipos</option>
                {optionsSet("Tipo").map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>

                <label htmlFor="temas">Temas:</label>
                <div id="temas" className={stylesSearcher.tag_container}>
                {Array.from(themesSet).map((opt) => {
                    const selected = filters.temas.includes(opt);
                    return (
                        <button
                        key={opt}
                        type="button"
                        className={`${stylesSearcher.tag} ${selected ? stylesSearcher.selected : ""}`}
                        onClick={() => {
                        const newTema = selected
                            ? filters.temas.filter((t) => t !== opt)
                            : [...filters.temas, opt];
                        updateFilter("temas", newTema);
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
                value={filters.idioma}
                onChange={(e) => updateFilter("idioma", e.target.value)}
                >
                <option value="">Todos los idiomas</option>
                {optionsSet("Idioma").map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>

                <label htmlFor="original">Idioma original:</label>
                <select
                id="original"
                value={filters.original}
                onChange={(e) => updateFilter("original", e.target.value)}
                >
                <option value="">Todos los idiomas originales</option>
                {optionsSet("Original").map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>

                <label htmlFor="saga">Saga:</label>
                <input
                id="saga"
                type="text"
                value={filters.saga}
                onChange={(e) => updateFilter("saga", e.target.value)}
                />

                <hr className={stylesSearcher.barra_separadora}/>

                <label htmlFor="sexo">Sexo del autor:</label>
                <select id="sexo" name="sexo" value={filters.sexo || ""} onChange={(e) => updateFilter("sexo", e.target.value)}>
                <option value="">Hombre y mujer</option>
                    {sex.map((sexo) => (
                      <option key={sexo} value={sexo}>{sexo}</option>
                    ))}
                </select>

                <label htmlFor="pais">País del autor:
                    <TooltipInternal text="ⓘ">País en el que nació el autor, que no siempre coincide con la nacionalidad.</TooltipInternal>
                </label>
                <select id="pais" name="pais" value={filters.país || ""} onChange={(e) => updateFilter("país", e.target.value)}>
                <option value="">Todos los países</option>
                    {countries.map((pais) => (
                      <option key={pais} value={pais}>{pais}</option>
                    ))}
                </select>
            </aside>

            <main className={stylesSearcher.results}>
                <div className={stylesSearcher.table_container}>
                    <table className={stylesSearcher.tabla_principal}>
                        <thead>
                            <tr>
                                <th>
                                    Título
                                    <span onClick={() => toggleSort("Título")} className={stylesSearcher.sort_arrow}>
                                    {sortConfig?.key === "Título"
                                        ? sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "▼"}
                                    </span>
                                </th>
                                <th>
                                    Autor(es)
                                    <span onClick={() => toggleSort("Autor")} className={stylesSearcher.sort_arrow}>
                                    {sortConfig?.key === "Autor"
                                        ? sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "▼"}
                                    </span>
                                </th>
                                <th>
                                    Año
                                    <span onClick={() => toggleSort("Publicación")} className={stylesSearcher.sort_arrow}>
                                    {sortConfig?.key === "Publicación"
                                        ? sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "▼"}
                                    </span>
                                </th>
                                <th>
                                    Tipo
                                    <span onClick={() => toggleSort("Tipo")} className={stylesSearcher.sort_arrow}>
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
                            <tr key={index} className={book.Editado ? stylesSearcher.libro_editado : undefined}>
                                <td>
                                    {book.Enlace !== "" ? <a href={book.Enlace} target="_blank">{book.Título}</a> : book.Título}
                                    {book.Otros !== "" ? <TooltipInternal text="✚">Otras ediciones: {book.Otros}</TooltipInternal> : undefined}
                                </td>
                                <td>{book.Autor}</td>
                                <td>
                                    {book.Publicación.startsWith("-")
                                        ? `${book.Publicación.slice(1)} a. C.`
                                        : book.Publicación.startsWith("0")
                                            ? book.Publicación.replace(/^0+/, "")
                                            : book.Publicación}
                                </td>
                                <td><span className={`${stylesSearcher.estilo_tipo} ${stylesSearcher[Object.entries(typeStyles).find(([, list]) => list.includes(book.Tipo))?.[0] ?? ""]}`}>{book.Tipo}</span></td>
                                <td>{book.Tema}</td>
                                <td>
                                    {!reported.includes(book.ID) && (
                                        <button
                                        className={stylesSearcher.report_button}
                                        type="button"
                                        onClick={() => {
                                            setSelectedBook(book);
                                            setActivePopup("reportar-libro");
                                        }}
                                        >
                                        ❌
                                        </button>
                                    )}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={stylesSearcher.barra_inferior}>
                    <p id={stylesSearcher.numero_resultados}>
                        {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}
                        <TooltipInternal text="ⓘ">
                            <span>
                                · Los números entre paréntesis indican el orden dentro de la saga.<br/>
                                · Párate sobre <span className={stylesSearcher.bs_1}>✚</span> para ver otras ediciones del mismo libro.<br/>
                                · Los libros con <span className={`${stylesSearcher.bs_2} ${filters.editado === "true" ? stylesSearcher.editado_activado : ""}`} onClick={() => updateFilter("editado", filters.editado === "true" ? "" : "true")}>fondo amarillo</span> son ediciones hechas por EyL.<br/>
                                · Haz clic en <span className={stylesSearcher.bs_3}>✖</span> para reportar información errada o faltante.
                            </span>
                        </TooltipInternal>
                    </p>
                    <p>Puedes ayudar al servidor <a href="https://discord.com/channels/403377475947855882/1290810391089123388" target="_blank">donando los libros que tengas</a>. ¡Te lo agradecemos muchísimo!</p>
                </div>
                {activePopup === "reportar-libro" && selectedBook && (
                    <Popup onClose={() => { setActivePopup(null); setSelectedBook(null); }}>
                        <h2>Reportar libro</h2>
                        <p>
                            Rellena este formulario para reportar información errada, faltante, o que quieras
                            añadir al libro <span className={stylesSearcher.reportar_form_titulo_libro}>{selectedBook.Título}</span>.
                            ¡Es de mucha ayuda que nos ayudes a clasificar los libros según sus temas! Sé lo más descriptivo
                            posible. Al enviar el reporte, se abrirá una pestaña de Google Forms, que es el servicio que
                            utilizamos. Es totalmente anónimo.
                        </p>
                        <div className={stylesSearcher.reportar_eyl_form}>
                            <div className={stylesSearcher.reportar_eyl_form_inputs}>
                                <form action="https://docs.google.com/forms/d/e/1FAIpQLSdZ02qn6Q_GOFbqeKiD0vwl6xH62XHGBFnVJ43OOEmSiGpT6Q/formResponse" method="POST" target="_blank">
                                    <input name="entry.491655063" id="reportar-id-libro" type="text" value={selectedBook.ID} className={stylesSearcher.reportar_form_hidden} readOnly/>

                                    <input name="entry.431514674" id="reportar-titulo-libro" type="text" value={selectedBook.Título} className={stylesSearcher.reportar_form_hidden} readOnly/>

                                    <label htmlFor="reportar-mensaje-libro">Explicación del reporte: <span className={stylesSearcher.error_asterisk}>*</span></label>
                                    <textarea name="entry.1960922008" id="reportar-mensaje-libro" placeholder="Describe los cambios que quieras ver." required/>

                                    <select name="entry.327392589" id="reportar-estado-libro" className={stylesSearcher.reportar_form_hidden} required>
                                        <option value="Faltante" selected>Faltante</option>
                                    </select>

                                    <select name="entry.236913060" id="reportar-origen-libro" className={stylesSearcher.reportar_form_hidden} required>
                                        <option value="Externo" selected>Externo</option>
                                    </select>

                                    <button className={stylesSearcher.send_report_button} type="submit">Enviar reporte</button>
                                </form>
                            </div>
                        </div>
                    </Popup>
                )}
            </main>
        </>
    );
}
