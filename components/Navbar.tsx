'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Popup from '@/components/Popup'
import { puedeEnviarReporte, registrarReporte } from "@/utils/reportLimiter";

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
                    <li onClick={() => irAPagina('/buscador')} className={pathname.startsWith('/buscador') ? 'pagina-activa' : ''}>🔍</li>
                    <li onClick={() => irAPagina('/indices')} className={pathname.startsWith('/indices') ? 'pagina-activa' : ''}>📄</li>
                    <li onClick={() => irAPagina('/estadisticas')} className={pathname.startsWith('/estadisticas') ? 'pagina-activa' : ''}>📊</li>
                </ul>
            </div>
            <div className="navbar-info">
                <ul>
                    <li onClick={() => setPopupActivo('reportar-eyl')} className="navbar-report">❌</li>
                    {popupActivo === 'reportar-eyl' && (
                        <Popup onClose={() => setPopupActivo(null)}>
                            <h2>Reportar errores</h2>
                            <p>
                                Si encuentras algún error en el funcionamiento del sitio, puedes
                                usar este formulario para reportarlo. Puedes enviar un reporte por
                                día. Al enviar el reporte, se abrirá una pestaña de Google Forms,
                                que es el servicio que utilizamos. Es totalmente anónimo.
                            </p>
                            <div className="reportar-eyl-form">
                                <div className="reportar-eyl-form-inputs">
                                    <form
                                    action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfHE1YEpt1XLPOlbxV_cWI4-4VAKARRzWI7SRW5UKkTA_dewQ/formResponse"
                                    method="POST"
                                    target="_blank"
                                    onSubmit={(e) => {
                                        if (!puedeEnviarReporte()) {
                                            e.preventDefault();
                                            alert("Sólo puede enviarse un reporte por día. Inténtalo de nuevo mañana.");
                                            return;
                                        }
                                        registrarReporte();
                                    }}
                                    >
                                        <label htmlFor="reporte-tipo">Tipo de error: <span className="error-asterisk">*</span></label>
                                        <select name="entry.1658570772" id="reporte-tipo" required>
                                            <option value="" disabled selected>Selecciona una opción</option>
                                            <option value="Página no encontrada (404)">Página no encontrada (404)</option>
                                            <option value="Tipografía (ortografía/gramática)">Tipografía (ortografía/gramática)</option>
                                            <option value="Estilo (PC)">Estilo (PC)</option>
                                            <option value="Estilo (teléfonos)">Estilo (teléfonos)</option>
                                            <option value="Otro">Otro</option>
                                        </select>

                                        <label htmlFor="reporte-navegador">Navegador usado: <span className="error-asterisk">*</span></label>
                                        <select name="entry.982016317" id="reporte-navegador" required>
                                            <option value="" disabled selected>Selecciona una opción</option>
                                            <option value="Chrome">Chrome</option>
                                            <option value="Edge">Edge</option>
                                            <option value="Safari">Safari</option>
                                            <option value="Firefox">Firefox</option>
                                            <option value="Opera">Opera</option>
                                            <option value="Brave">Brave</option>
                                            <option value="Otro">Otro</option>
                                        </select>

                                        <label htmlFor="reportar-mensaje">Explicación del error: <span className="error-asterisk">*</span></label>
                                        <textarea name="entry.440380913" id="reportar-mensaje" placeholder="Describe paso a paso cómo ocurrió el error." required/>

                                        <select name="entry.440380913" id="reporte-estado" className="reportar-form-hidden">
                                            <option value="Faltante">Faltante</option>
                                        </select>

                                        <button id="send-report-button" type="submit">Enviar reporte</button>
                                    </form>
                                </div>
                            </div>
                        </Popup>
                    )}
                    <li onClick={() => setPopupActivo('sobre-eyl')}>ℹ️</li>
                    {popupActivo === 'sobre-eyl' && (
                        <Popup onClose={() => setPopupActivo(null)}>
                            <h2>Sobre la Biblioteca</h2>
                            <p>
                                Creado con <a href="https://nextjs.org/" target="_blank">Next.js</a> (usando TypeScript).
                                Hosteado en <a href="https://pages.github.com/" target="_blank">GitHub Pages</a>.
                                Puedes ver el código fuente <a href="https://github.com/EscrituraYLectura/biblioteca">aquí</a>.
                                Si quieres contribuir, puedes abrir
                                un issue o pull request en el repositorio. En la wiki hay más información.
                                Usamos Google Drive para guardar los datos de los libros; puedes ver
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
