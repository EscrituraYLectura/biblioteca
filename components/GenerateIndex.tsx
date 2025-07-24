"use client";

import libros from "@/public/libros.json";
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

const letters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S",
    "T", "U", "V", "W", "X", "Y", "Z", "#"
];

const normalise = (text: string) =>
    text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const getLetter = (text: string) => {
    if (!text) return "#";
    const match = text.match(/\p{Letter}/u);
    if (!match) return "#";

    let letter = match[0].toUpperCase();
    if (letter === "Ñ") return "Ñ";

    letter = letter.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return /^[A-Z]$/.test(letter) ? letter : "#";
};

const order = (a: string, b: string) => {
    const sa = normalise(a).replace(/[^a-zñ0-9]/gi, "");
    const sb = normalise(b).replace(/[^a-zñ0-9]/gi, "");
    return sa.localeCompare(sb);
};

const orderSaga = (a: Book, b: Book) => {
    const numA = parseInt(a.Título.match(/\(#(\d+)\)/)?.[1] || "0");
    const numB = parseInt(b.Título.match(/\(#(\d+)\)/)?.[1] || "0");
    return numA - numB;
};

// Agrupación por letra para libros
const groupByLetter = (books: Book[]) => {
    const grouped: Record<string, (Book | { saga: string; authors: Set<string>; books: Book[] })[]> = {};
    const sagas: Record<string, { saga: string; authors: Set<string>; books: Book[] }> = {};
    const individuals: Book[] = [];

    for (const book of books) {
        if (book.Saga) {
            if (!sagas[book.Saga]) {
                sagas[book.Saga] = { saga: book.Saga, authors: new Set(), books: [] };
            }
            sagas[book.Saga].books.push(book);
            sagas[book.Saga].authors.add(book.Autor);
        } else {
            individuals.push(book);
        }
    }

    individuals.sort((a, b) => order(a.Título, b.Título));
    for (const key in sagas) {
        sagas[key].books.sort(orderSaga);
    }

    const everything: (Book | { saga: string; authors: Set<string>; books: Book[] })[] = [
        ...individuals,
        ...Object.values(sagas)
    ];

    for (const item of everything) {
        const text = "Título" in item ? item.Título : item.saga;
        const letter = getLetter(text);
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(item);
    }

    for (const letter in grouped) {
        grouped[letter].sort((a, b) => {
            const ta = "Título" in a ? a.Título : a.saga;
            const tb = "Título" in b ? b.Título : b.saga;
            return order(ta, tb);
        });
    }

    return grouped;
};

// Agrupación por autor
const groupByAuthor = (books: Book[]) => {
    const authors: Record<string, Book[]> = {};

    for (const book of books) {
        const authorList = book.Autor.split(",").map(a => a.trim());

        for (const individualAuthor of authorList) {
            if (!authors[individualAuthor]) authors[individualAuthor] = [];
            authors[individualAuthor].push(book);
        }
    }

    const ordered = Object.entries(authors).sort(([a], [b]) => order(a, b));

    const grouped: Record<string, { author: string; books: Book[] }[]> = {};
    for (const [author, books] of ordered) {
        const letter = getLetter(author);
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push({ author, books });
    }

    return grouped;
};

function renderBookView(items: (Book | { saga: string; authors: Set<string>; books: Book[] })[]) {
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
            const showAuthors = item.authors.size > 1;
            return (
                <div key={`${item.saga}-${index}`}>
                    <p>– {item.saga}, {showAuthors ? "AA. VV." : Array.from(item.authors)[0]}:</p>
                    <ul>
                        {item.books.map((book, idx) => (
                            <li key={`${book.Título}-${book.Autor}-${idx}`}>
                            <Link href={book.Enlace} target="_blank" className={stylesIndex.i_titulo}>{book.Título}</Link>
                            {showAuthors && `, ${book.Autor}`}
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

function renderAuthorView(items: { author: string; books: Book[] }[]) {
    return items.map(({ author, books }, index) => (
        <div key={`${author}-${index}`}>
            <p>{author}:</p>
            <ul>
                {books.map((book, idx) => {
                    const coAuthors = book.Autor.split(",").map(a => a.trim()).filter(a => a !== author);
                    const extraLanguage = book.Idioma !== "Español" ? `(en ${book.Idioma.toLowerCase()})` : "";
                    const colab = coAuthors.length > 0 ? `(en colaboración con ${coAuthors.join(", ")})` : "";
                    const extraSaga = book.Saga ? `(de la saga ${book.Saga})` : "";

                    return (
                        <li key={`${book.Título}-${idx}`}>
                            <Link href={book.Enlace} target="_blank" className={stylesIndex.i_titulo}>{book.Título}</Link>{" "}
                            {extraLanguage && <span className={stylesIndex.i_mas_info}> {extraLanguage}</span>}
                            {colab && <span className={stylesIndex.i_mas_info}> {colab}</span>}
                            {extraSaga && <span className={stylesIndex.i_mas_info}> {extraSaga}</span>}
                        </li>
                    );
                })}
            </ul>
        </div>
    ));
}

export default function GenerateIndex() {
    const searchParams = useSearchParams();
    const type = searchParams.get("tipo") || "libros";
    const router = useRouter();

    const bookView = type === "libros";
    const data = useMemo(() => bookView ? groupByLetter(libros as Book[]) : groupByAuthor(libros as Book[]), [bookView]);

    const changeView = (newView: string) => {
        const url = newView === "libros" ? "/indices?tipo=libros" : "/indices?tipo=autores";
        router.push(url);
    };

    return (
        <>
            <aside className={stylesIndex.sidebar_indices}>
                <h2 className={stylesIndex.pagina_subtitulo}>Índices</h2>

                <div className={stylesIndex.vista_selector}>
                    <button onClick={() => changeView("libros")} disabled={bookView}>Por título</button>
                    <button onClick={() => changeView("autores")} disabled={!bookView}>Por autor</button>
                </div>

                <hr className={stylesIndex.barra_separadora}/>

                <ul>
                    {letters.map((letter) => (
                        <li key={letter}>
                            <a href={`#${letter === "#" ? "%23" : letter}`} className={stylesIndex.indice_enlace}>
                            {letter === "#" ? "Otros" : `Letra ${letter}`}
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>

            <main className={stylesIndex.contenedor_indices}>
                <div className={`${stylesIndex.table_container} ${stylesIndex.table_container_indices}`}>
                    {letters.map((letter) => {
                        const items = data[letter] ?? [];
                        const sinElementos = items.length === 0;

                        return (
                            <div key={letter} id={letter} className={stylesIndex.contenedor_letra_libros}>
                                <h2 className={stylesIndex.i_letra}>{letter}</h2>
                                {sinElementos ? (
                                    <p className={stylesIndex.i_sin_elementos}>No hay elementos con esta letra.</p>
                                ) : bookView ? (
                                    renderBookView(items as (Book | { saga: string; authors: Set<string>; books: Book[] })[])
                                ) : (
                                    renderAuthorView(items as { author: string; books: Book[] }[])
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
}
