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
                                Si encuentras algún error en el funcionamiento del sitio, puedes<br/>
                                usar este formulario para reportarlo.
                            </p>
                            <div className="reportar-eyl-form">
                                <div className="reportar-eyl-form-inputs">
                                    <div>
                                        <label htmlFor="reporte-tipo">Tipo de error: <span className="error-asterisk">*</span></label>
                                        <select id="reporte-tipo" required>
                                            <option value="" disabled selected>Selecciona una opción</option>
                                            <option value="">Página no encontrada (404)</option>
                                            <option value="">Tipografía (ortografía/gramática)</option>
                                            <option value="">Estilo (PC)</option>
                                            <option value="">Estilo (teléfonos)</option>
                                            <option value="">Otro</option>
                                        </select>

                                        <label htmlFor="reporte-navegador">Navegador usado: <span className="error-asterisk">*</span></label>
                                        <select id="reporte-navegador" required>
                                            <option value="" disabled selected>Selecciona una opción</option>
                                            <option value="">Chrome</option>
                                            <option value="">Edge</option>
                                            <option value="">Safari</option>
                                            <option value="">Firefox</option>
                                            <option value="">Opera</option>
                                            <option value="">Brave</option>
                                            <option value="">Otro</option>
                                        </select>

                                        <label htmlFor="reportar-mensaje">Explicación del error: <span className="error-asterisk">*</span></label>
                                        <textarea id="reportar-mensaje" placeholder="Describe paso a paso cómo ocurrió el error." required/>
                                    </div>
                                </div>

                                <button id="send-report-button" type="button">Enviar reporte</button>
                            </div>
                        </Popup>
                    )}
                    <li onClick={() => setPopupActivo('sobre-eyl')}>ⓘ</li>
                    {popupActivo === 'sobre-eyl' && (
                        <Popup onClose={() => setPopupActivo(null)}>
                            <h2>Sobre la Biblioteca</h2>
                            <p>
                                Creado con <a href="https://nextjs.org/" target="_blank">Next.js</a> (usando TypeScript).
                                Hosteado en <a href="https://pages.github.com/" target="_blank">GitHub Pages</a>.<br/>
                                Puedes ver el código fuente <a href="https://github.com/EscrituraYLectura/biblioteca">aquí</a>.
                                Si quieres contribuir, puedes abrir<br/>
                                un issue o pull request en el repositorio. En la wiki hay más información.<br/>
                                Usamos Google Drive para guardar los datos de los libros; puedes ver<br/>
                                el archivo <a href="https://docs.google.com/spreadsheets/d/1KzBwhtz-t_5i1V9vl6FdALE17SM_5Ep9sKwWG2jN-hM/edit?usp=sharing" target="_blank">aquí</a>.
                                El estilo es una imitación del <a href="https://discord.com/branding" target="_blank">estilo de Discord</a>.
                            </p>
                        </Popup>
                    )}
                </ul>
            </div>
        </nav>
    );
}
