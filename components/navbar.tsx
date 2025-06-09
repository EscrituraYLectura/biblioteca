'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Popup from '@/components/Popup'

export default function NavBar() {
    const router = useRouter();

    const irAPagina = (pagina: string) => {
        router.push(pagina);
    }

    const [mostrarPopup, setMostrarPopup] = useState(false);

    return (
        <nav className="navbar">
            <ul>
                <li onClick={() => irAPagina('/buscador')}>⌕</li>
                <li onClick={() => irAPagina('/indices')}>≡</li>
                <li onClick={() => irAPagina('/realista')}>⊞</li>
                <li onClick={() => irAPagina('/estadisticas')}>◉</li>
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
        </nav>
    );
}
