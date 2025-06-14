"use client";

import data from "@/public/data.json";
import Link from "next/link";
import { useMemo } from "react";

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

const IGNORAR_ESPACIOS = false;

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
    const sa = normalizar(IGNORAR_ESPACIOS ? a.replace(/\s/g, "") : a).replace(/[^a-zñ0-9]/gi, "");
    const sb = normalizar(IGNORAR_ESPACIOS ? b.replace(/\s/g, "") : b).replace(/[^a-zñ0-9]/gi, "");
    return sa.localeCompare(sb);
};

const ordenarSaga = (a: Book, b: Book) => {
    const numA = parseInt(a.Título.match(/\(#(\d+)\)/)?.[1] || "0");
    const numB = parseInt(b.Título.match(/\(#(\d+)\)/)?.[1] || "0");
    return numA - numB;
};

export default function ListaOrdenada() {
    const agrupado = useMemo(() => {
        const agrupadoPorLetra: Record<string, (Book | { saga: string; autores: Set<string>; libros: Book[] })[]> = {};

        const sagas: Record<string, { saga: string; autores: Set<string>; libros: Book[] }> = {};
        const librosSueltos: Book[] = [];

        for (const book of data as Book[]) {
            if (book.Saga) {
                if (!sagas[book.Saga]) {
                    sagas[book.Saga] = {
                        saga: book.Saga,
                        autores: new Set(),
                        libros: []
                    };
                }
                sagas[book.Saga].libros.push(book);
                sagas[book.Saga].autores.add(book.Autor);
            } else {
                librosSueltos.push(book);
            }
        }

        // Ordenar libros sueltos y sagas por título/saga
        librosSueltos.sort((a, b) => ordenar(a.Título, b.Título));

        for (const key in sagas) {
            sagas[key].libros.sort(ordenarSaga);
        }

        const todoJunto: (Book | { saga: string; autores: Set<string>; libros: Book[] })[] = [
            ...librosSueltos,
            ...Object.values(sagas)
        ];

        // Agrupar por letra
        for (const item of todoJunto) {
            const texto = "Título" in item ? item.Título : item.saga;
            const letra = getLetra(texto);
            if (!agrupadoPorLetra[letra]) agrupadoPorLetra[letra] = [];
            agrupadoPorLetra[letra].push(item);
        }

        // Ordenar dentro de cada letra
        for (const letra in agrupadoPorLetra) {
            agrupadoPorLetra[letra].sort((a, b) => {
                const ta = "Título" in a ? a.Título : a.saga;
                const tb = "Título" in b ? b.Título : b.saga;
                return ordenar(ta, tb);
            });
        }

        return agrupadoPorLetra;
    }, []);

    const letras = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
        "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S",
        "T", "U", "V", "W", "X", "Y", "Z", "#"
    ];

    return (
        <>
            <aside className="sidebar-indices">
                <ul>
                    {letras.map((letra) => (
                        <li key={letra}>
                            <a href={`#${letra === "#" ? "%23" : letra}`} className="indice-enlace">
                                {letra === "#" ? "Otros" : `Letra ${letra}`}
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>

            <main className="contenedor-indices">
                <div className="table-container table-container-indices">
                {letras.map((letra) => (
                    <div key={letra} id={letra}>
                        <h2 className="i-letra">{letra}</h2>
                        {agrupado[letra]?.map((item, index) => {
                            if ("Título" in item) {
                                return (
                                    <p key={`${item.Título}-${item.Autor}-${index}`}>
                                        – <Link href={item.Enlace} target="_blank" className="i-titulo">{item.Título}</Link>, {item.Autor}
                                        {item.Idioma !== "Español" && (
                                            <span className="i-mas-info"> (en {item.Idioma.toLowerCase()})</span>
                                        )}
                                    </p>
                                );
                            } else {
                                const autores = item.autores;
                                const mostrarAutores = autores.size > 1;
                                return (
                                    <div key={`${item.saga}-${index}`}>
                                        <p>– {item.saga}, {mostrarAutores ? "AA. VV." : Array.from(autores)[0]}:</p>
                                        <ul className="list-[circle] ml-6">
                                            {item.libros.map((book, idx) => (
                                                <li key={`${book.Título}-${book.Autor}-${idx}`}>
                                                    <Link href={book.Enlace} target="_blank" className="i-titulo">{book.Título}</Link>
                                                    {mostrarAutores && `, ${book.Autor}`}
                                                    {book.Idioma !== "Español" && (
                                                        <span className="i-mas-info"> (en {book.Idioma.toLowerCase()})</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            }
                        })}
                    </div>
                ))}
                </div>
                <div className="barra-inferior">
                    <p>Información</p>
                </div>
            </main>
        </>
    );
}
