'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Popup from '@/components/Popup'

export default function NavBar() {
    const router = useRouter();

    const irAPagina = (pagina: string) => {
        router.push(pagina);
    }

    const [popupActivo, setPopupActivo] = useState<string | null>(null);


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
                    <li onClick={() => setPopupActivo('reportar-eyl')} className="navbar-report">✖</li>
                    {popupActivo === 'reportar-eyl' && (
                        <Popup onClose={() => setPopupActivo(null)}>
                            <h2>Reportar errores</h2>
                            <p>
                                Si encuentras algún error en el funcionamiento de la página (filtros, orden,<br/>
                                página no encontrada, elementos mal posicionados, etc.) puedes usar este<br/>
                                formulario para reportarlo. Por favor, sé lo más exacto posible para poder<br/>
                                replicar el error. Opcionalmente, y si tienes una cuenta en GitHub, puedes<br/>
                                escribir tu nombre de usuario para poder mencionarte. Si encuentras información<br/>
                                errada o faltante sobre un libro, usa el botón correspondiente que aparece en<br/>
                                el lateral derecho de la tabla.
                            </p>
                            <div className="reportar-eyl-form">
                                <label htmlFor="reportar-mensaje">Explicación del error:</label>
                                <textarea id="reportar-mensaje" placeholder="Sé lo más descriptivo posible."/>

                                <div className="reportar-eyl-form-inputs">
                                    <div>
                                        <label htmlFor="reporte-error">Tipo de error:</label>
                                        <select id="reporte-error">
                                        <option value="">Otro</option>
                                        <option value="">Estilo (PC)</option>
                                        <option value="">Estilo (teléfonos)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="usuario-github">Nombre de usuario de GitHub:</label>
                                        <input id="usuario-github" type="text" placeholder="Este campo es opcional."/>
                                    </div>
                                </div>

                                <button id="send-report-button" type="button">Enviar</button>
                            </div>
                        </Popup>
                    )}
                    <li onClick={() => setPopupActivo('sobre-eyl')}>ⓘ</li>
                    {popupActivo === 'sobre-eyl' && (
                        <Popup onClose={() => setPopupActivo(null)}>
                            <h2>Biblioteca</h2>
                            <p>
                                Creado con <a href="https://nextjs.org/" target="_blank">Next.js</a> (usando TypeScript).
                                Hosteado en <a href="https://pages.github.com/" target="_blank">GitHub Pages</a>.
                                Puedes ver el código fuente <a href="https://github.com/EscrituraYLectura/biblioteca">aquí</a>.<br/>
                                Si quieres contribuir, puedes abrir un issue o pull request en el repositorio. En la wiki hay más información.<br/>
                                Usamos Google Drive para guardar los datos de los libros; puedes ver el archivo <a href="https://docs.google.com/spreadsheets/d/1KzBwhtz-t_5i1V9vl6FdALE17SM_5Ep9sKwWG2jN-hM/edit?usp=sharing" target="_blank">aquí</a>.<br/>
                                El estilo es una imitación del <a href="https://discord.com/branding" target="_blank">estilo de Discord</a>.
                            </p>
                        </Popup>
                    )}
                </ul>
            </div>
        </nav>
    );
}
