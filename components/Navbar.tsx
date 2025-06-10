'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Popup from '@/components/Popup'

export default function NavBar() {
    const router = useRouter();

    const irAPagina = (pagina: string) => {
        router.push(pagina);
    }

    const [mostrarPopup, setMostrarPopup] = useState(false);

    const pathname = usePathname();

    return (
        <nav className="navbar">
            <div className="navbar-pages">
                <ul>
                    <li onClick={() => irAPagina('/buscador')} className={pathname.startsWith('/buscador') ? 'pagina-activa' : ''}>⌕</li>
                    <li onClick={() => irAPagina('/indices')} className={pathname.startsWith('/indices') ? 'pagina-activa' : ''}>≡</li>
                    <li onClick={() => irAPagina('/estadisticas')} className={pathname.startsWith('/estadisticas') ? 'pagina-activa' : ''}>⊞</li>
                </ul>
            </div>
            <div className="navbar-info">
                <ul>
                    <li className="navbar-report">✖</li>
                    <li onClick={() => setMostrarPopup(true)}>ⓘ</li>
                    {mostrarPopup && (
                        <Popup onClose={() => setMostrarPopup(false)}>
                            <h2>Biblioteca de Escritura y Lectura</h2>
                            <p>
                                Sitio web de la Biblioteca de Escritura y Lectura.<br/>
                                Creado con <a href="https://nextjs.org/" target="_blank">Next.js</a>;
                                hosteado en <a href="https://github.com/EscrituraYLectura/biblioteca" target="_blank">GitHub Pages</a>.<br/>
                                También puedes ver los datos en la <a href="https://docs.google.com/spreadsheets/d/1KzBwhtz-t_5i1V9vl6FdALE17SM_5Ep9sKwWG2jN-hM/edit?usp=sharing" target="_blank">base de datos</a>.<br/>
                                El estilo es una imitación del estilo de Discord.
                            </p>
                        </Popup>
                    )}
                </ul>
            </div>
        </nav>
    );
}
