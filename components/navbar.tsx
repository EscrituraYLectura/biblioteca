'use client';

import { useRouter } from 'next/navigation';

export default function NavBar() {
    const router = useRouter();

    const irAPagina = (pagina: string) => {
        router.push(pagina);
    }

    return (
        <nav className="navbar">
            <ul>
                <li onClick={() => irAPagina('/buscador')}>⌕</li>
                <li onClick={() => irAPagina('/indices')}>≡</li>
                <li onClick={() => irAPagina('/realista')}>⊞</li>
                <li onClick={() => irAPagina('/estadisticas')}>◉</li>
            </ul>
        </nav>
    );
}
