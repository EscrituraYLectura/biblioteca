"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TooltipInternal } from "@/components/Tooltip";
import Popup from "@/components/Popup"
import data from "@/public/libros.json";
import autores from "@/public/autores.json";
import reportes from "@/public/reportes.json";
import stylesSearcher from "@/styles/pages/buscador.module.scss"

const reportados: string[] = reportes as string[];

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
    Título: string;
    Autor: string;
    Publicación: string;
    Tipo: string;
    Tema: string[];
    Idioma: string;
    Original: string;
    Saga: string;
    Editado: string;
    Sexo: string;
    País: string;
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
    Sexo: "",
    País: "",
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
    const [popupActivo, setPopupActivo] = useState<string | null>(null);
    const [libroSeleccionado, setLibroSeleccionado] = useState<Book | null>(null);

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
            // Filtros por campos del libro
            const pasaFiltrosLibro =
                (!filters.Título || book.Título.toLowerCase().includes(filters.Título.toLowerCase())) &&
                (!filters.Autor || book.Autor.toLowerCase().includes(filters.Autor.toLowerCase())) &&
                (!filters.Publicación || book.Publicación.includes(filters.Publicación)) &&
                (!filters.Tipo || book.Tipo === filters.Tipo) &&
                (filters.Tema.length === 0 || filters.Tema.every((t) => book.Tema.split(",").map(s => s.trim()).includes(t))) &&
                (!filters.Idioma || book.Idioma === filters.Idioma) &&
                (!filters.Original || book.Original === filters.Original) &&
                (!filters.Saga || book.Saga.toLowerCase().includes(filters.Saga.toLowerCase())) &&
                (!filters.Editado || book.Editado === filters.Editado);

            if (!pasaFiltrosLibro) return false;

            // Filtros por sexo del autor y país del autor (usando autores.json)
            const autoresLibro = book.Autor.split(",").map((nombre) => nombre.trim());
            const datosAutores = autoresLibro
                .map((nombre) =>
                    autores.find((a) => a.Nombre.toLowerCase() === nombre.toLowerCase())
                )
                .filter(Boolean);

            if (filters.Sexo && !datosAutores.some((a) => a?.Sexo === filters.Sexo)) {
                return false;
            }

            if (filters.País && !datosAutores.some((a) => a?.País === filters.País)) {
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

    const sexos = useMemo(() => {
        const set = new Set(autores.map((a) => a.Sexo).filter(Boolean));
        return Array.from(set);
    }, []);

    const paises = useMemo(() => {
        const set = new Set(autores.map((a) => a.País).filter(Boolean));
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
                        Título: "",
                        Autor: "",
                        Publicación: "",
                        Tipo: "",
                        Tema: [],
                        Idioma: "",
                        Original: "",
                        Saga: "",
                        Editado: "",
                        Sexo: "",
                        País: "",
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
                    <TooltipInternal text="ⓘ">Puedes escribir tres dígitos para buscar por década. Ej.: "198" para la década de 1980.</TooltipInternal>
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
                <div id="temas" className={stylesSearcher.tag_container}>
                {Array.from(temasSet).map((opt) => {
                    const selected = filters.Tema.includes(opt);
                    return (
                        <button
                        key={opt}
                        type="button"
                        className={`${stylesSearcher.tag} ${selected ? stylesSearcher.selected : ""}`}
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

                <hr className={stylesSearcher.barra_separadora}/>

                <label htmlFor="sexo">Sexo del autor:</label>
                <select id="sexo" name="sexo" value={filters.Sexo || ""} onChange={(e) => updateFilter("Sexo", e.target.value)}>
                <option value="">Hombre y mujer</option>
                    {sexos.map((sexo) => (
                      <option key={sexo} value={sexo}>{sexo}</option>
                    ))}
                </select>

                <label htmlFor="pais">País del autor:</label>
                <select id="pais" name="pais" value={filters.País || ""} onChange={(e) => updateFilter("País", e.target.value)}>
                <option value="">Todos los países</option>
                    {paises.map((pais) => (
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
                                    {!reportados.includes(book.ID) && (
                                        <button
                                        className={stylesSearcher.report_button}
                                        type="button"
                                        onClick={() => {
                                            setLibroSeleccionado(book);
                                            setPopupActivo("reportar-libro");
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
                                · Los libros con <span className={`${stylesSearcher.bs_2} ${filters.Editado === "true" ? stylesSearcher.editado_activado : ""}`} onClick={() => updateFilter("Editado", filters.Editado === "true" ? "" : "true")}>fondo amarillo</span> son ediciones hechas por EyL.<br/>
                                · Haz clic en <span className={stylesSearcher.bs_3}>✖</span> para reportar información errada o faltante.
                            </span>
                        </TooltipInternal>
                    </p>
                    <p>Puedes ayudar al servidor <a href="https://discord.com/channels/403377475947855882/1290810391089123388" target="_blank">donando los libros que tengas</a>. ¡Te lo agradecemos muchísimo!</p>
                </div>
                {popupActivo === "reportar-libro" && libroSeleccionado && (
                    <Popup onClose={() => { setPopupActivo(null); setLibroSeleccionado(null); }}>
                        <h2>Reportar libro</h2>
                        <p>
                            Rellena este formulario para reportar información errada, faltante, o que quieras
                            añadir al libro <span className={stylesSearcher.reportar_form_titulo_libro}>{libroSeleccionado.Título}</span>.
                            ¡Es de mucha ayuda que nos ayudes a clasificar los libros según sus temas! Sé lo más descriptivo
                            posible. Al enviar el reporte, se abrirá una pestaña de Google Forms, que es el servicio que
                            utilizamos. Es totalmente anónimo.
                        </p>
                        <div className={stylesSearcher.reportar_eyl_form}>
                            <div className={stylesSearcher.reportar_eyl_form_inputs}>
                                <form action="https://docs.google.com/forms/d/e/1FAIpQLSdZ02qn6Q_GOFbqeKiD0vwl6xH62XHGBFnVJ43OOEmSiGpT6Q/formResponse" method="POST" target="_blank">
                                    <input name="entry.491655063" id="reportar-id-libro" type="text" value={libroSeleccionado.ID} className={stylesSearcher.reportar_form_hidden} readOnly/>

                                    <input name="entry.431514674" id="reportar-titulo-libro" type="text" value={libroSeleccionado.Título} className={stylesSearcher.reportar_form_hidden} readOnly/>

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
