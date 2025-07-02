"use client";

import data from "@/public/libros.json";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import stylesIndex from "@/styles/pages/indices.module.scss";

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

const letras = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S",
    "T", "U", "V", "W", "X", "Y", "Z", "#"
];

const normalizar = (texto: string) =>
    texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const getLetra = (texto: string) => {
    if (!texto) return "#";
    const match = texto.match(/\p{Letter}/u);
    if (!match) return "#";

    let letra = match[0].toUpperCase();
    if (letra === "Ñ") return "Ñ";

    letra = letra.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return /^[A-Z]$/.test(letra) ? letra : "#";
};

const ordenar = (a: string, b: string) => {
    const sa = normalizar(a).replace(/[^a-zñ0-9]/gi, "");
    const sb = normalizar(b).replace(/[^a-zñ0-9]/gi, "");
    return sa.localeCompare(sb);
};

const ordenarSaga = (a: Book, b: Book) => {
    const numA = parseInt(a.Título.match(/\(#(\d+)\)/)?.[1] || "0");
    const numB = parseInt(b.Título.match(/\(#(\d+)\)/)?.[1] || "0");
    return numA - numB;
};

// Agrupación por letra para libros
const agruparPorLetra = (libros: Book[]) => {
    const agrupado: Record<string, (Book | { saga: string; autores: Set<string>; libros: Book[] })[]> = {};
    const sagas: Record<string, { saga: string; autores: Set<string>; libros: Book[] }> = {};
    const sueltos: Book[] = [];

    for (const book of libros) {
        if (book.Saga) {
            if (!sagas[book.Saga]) {
                sagas[book.Saga] = { saga: book.Saga, autores: new Set(), libros: [] };
            }
            sagas[book.Saga].libros.push(book);
            sagas[book.Saga].autores.add(book.Autor);
        } else {
            sueltos.push(book);
        }
    }

    sueltos.sort((a, b) => ordenar(a.Título, b.Título));
    for (const key in sagas) {
        sagas[key].libros.sort(ordenarSaga);
    }

    const todo: (Book | { saga: string; autores: Set<string>; libros: Book[] })[] = [
        ...sueltos,
        ...Object.values(sagas)
    ];

    for (const item of todo) {
        const texto = "Título" in item ? item.Título : item.saga;
        const letra = getLetra(texto);
        if (!agrupado[letra]) agrupado[letra] = [];
        agrupado[letra].push(item);
    }

    for (const letra in agrupado) {
        agrupado[letra].sort((a, b) => {
            const ta = "Título" in a ? a.Título : a.saga;
            const tb = "Título" in b ? b.Título : b.saga;
            return ordenar(ta, tb);
        });
    }

    return agrupado;
};

// Agrupación por autor
const agruparPorAutor = (libros: Book[]) => {
    const autores: Record<string, Book[]> = {};

    for (const libro of libros) {
        const autoresLista = libro.Autor.split(",").map(a => a.trim());

        for (const autorIndividual of autoresLista) {
            if (!autores[autorIndividual]) autores[autorIndividual] = [];
            autores[autorIndividual].push(libro);
        }
    }

    const ordenados = Object.entries(autores).sort(([a], [b]) => ordenar(a, b));

    const agrupado: Record<string, { autor: string; libros: Book[] }[]> = {};
    for (const [autor, libros] of ordenados) {
        const letra = getLetra(autor);
        if (!agrupado[letra]) agrupado[letra] = [];
        agrupado[letra].push({ autor, libros });
    }

    return agrupado;
};

function renderVistaLibros(items: (Book | { saga: string; autores: Set<string>; libros: Book[] })[]) {
    return items.map((item, index) => {
        if ("Título" in item) {
            return (
                <p key={`${item.Título}-${item.Autor}-${index}`}>
                – <Link href={item.Enlace} target="_blank" className={stylesIndex.i_titulo}>{item.Título}</Link>, {item.Autor}
                {item.Idioma !== "Español" && (
                    <span className={stylesIndex.i_mas_info}> (en {item.Idioma.toLowerCase()})</span>
                )}
                </p>
            );
        } else {
            const mostrarAutores = item.autores.size > 1;
            return (
                <div key={`${item.saga}-${index}`}>
                    <p>– {item.saga}, {mostrarAutores ? "AA. VV." : Array.from(item.autores)[0]}:</p>
                    <ul>
                        {item.libros.map((book, idx) => (
                            <li key={`${book.Título}-${book.Autor}-${idx}`}>
                            <Link href={book.Enlace} target="_blank" className={stylesIndex.i_titulo}>{book.Título}</Link>
                            {mostrarAutores && `, ${book.Autor}`}
                            {book.Idioma !== "Español" && (
                                <span className={stylesIndex.i_mas_info}> (en {book.Idioma.toLowerCase()})</span>
                            )}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
    });
}

function renderVistaAutores(items: { autor: string; libros: Book[] }[]) {
    return items.map(({ autor, libros }, index) => (
        <div key={`${autor}-${index}`}>
            <p>{autor}:</p>
            <ul>
                {libros.map((libro, idx) => {
                    const coautores = libro.Autor.split(",").map(a => a.trim()).filter(a => a !== autor);
                    const idiomaExtra = libro.Idioma !== "Español" ? `(en ${libro.Idioma.toLowerCase()})` : "";
                    const colaboracion = coautores.length > 0 ? `(en colaboración con ${coautores.join(", ")})` : "";
                    const sagaExtra = libro.Saga ? `(de la saga ${libro.Saga})` : "";

                    return (
                        <li key={`${libro.Título}-${idx}`}>
                            <Link href={libro.Enlace} target="_blank" className={stylesIndex.i_titulo}>{libro.Título}</Link>{" "}
                            {idiomaExtra && <span className={stylesIndex.i_mas_info}> {idiomaExtra}</span>}
                            {colaboracion && <span className={stylesIndex.i_mas_info}> {colaboracion}</span>}
                            {sagaExtra && <span className={stylesIndex.i_mas_info}> {sagaExtra}</span>}
                        </li>
                    );
                })}
            </ul>
        </div>
    ));
}

export default function GenerateIndex() {
    const searchParams = useSearchParams();
    const tipo = searchParams.get("tipo") || "libros";
    const router = useRouter();

    const vistaLibros = tipo === "libros";
    const datos = useMemo(() => vistaLibros ? agruparPorLetra(data as Book[]) : agruparPorAutor(data as Book[]), [vistaLibros]);

    const cambiarVista = (nuevaVista: string) => {
        const url = nuevaVista === "libros" ? "/indices?tipo=libros" : "/indices?tipo=autores";
        router.push(url);
    };

    return (
        <>
            <aside className={stylesIndex.sidebar_indices}>
                <h2 className={stylesIndex.pagina_subtitulo}>Índices</h2>

                <div className={stylesIndex.vista_selector}>
                    <button onClick={() => cambiarVista("libros")} disabled={vistaLibros}>Por título</button>
                    <button onClick={() => cambiarVista("autores")} disabled={!vistaLibros}>Por autor</button>
                </div>

                <ul>
                    {letras.map((letra) => (
                        <li key={letra}>
                            <a href={`#${letra === "#" ? "%23" : letra}`} className={stylesIndex.indice_enlace}>
                            {letra === "#" ? "Otros" : `Letra ${letra}`}
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>

            <main className={stylesIndex.contenedor_indices}>
                <div className={`${stylesIndex.table_container} ${stylesIndex.table_container_indices}`}>
                    {letras.map((letra) => {
                        const items = datos[letra] ?? [];
                        const sinElementos = items.length === 0;

                        return (
                            <div key={letra} id={letra} className={stylesIndex.contenedor_letra_libros}>
                                <h2 className={stylesIndex.i_letra}>{letra}</h2>
                                {sinElementos ? (
                                    <p className={stylesIndex.i_sin_elementos}>No hay elementos con esta letra.</p>
                                ) : vistaLibros ? (
                                    renderVistaLibros(items as (Book | { saga: string; autores: Set<string>; libros: Book[] })[])
                                ) : (
                                    renderVistaAutores(items as { autor: string; libros: Book[] }[])
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
}
