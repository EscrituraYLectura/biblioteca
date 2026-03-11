"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Popup from "@/components/Popup"
import { canSendReport, recordReport } from "@/utils/reportLimiter";
import stylesNavbar from "@/styles/components/navbar.module.scss";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function NavBar() {
    const router = useRouter();

    const goToPage = (pagina: string) => {
        router.push(pagina);
    }

    const [activePopup, setActivePopup] = useState<string | null>(null);

    const pathname = usePathname();

    return (
        <nav className={stylesNavbar.navbar}>
            <div className={stylesNavbar.navbar_pages}>
                <ul>
                    <li onClick={() => goToPage("/buscador")} className={pathname.startsWith("/buscador") ? stylesNavbar.pagina_activa : ""}>🔍</li>
                    <li onClick={() => goToPage("/indices")} className={pathname.startsWith("/indices") ? stylesNavbar.pagina_activa : ""}>📄</li>
                    <li onClick={() => goToPage("/estadisticas")} className={pathname.startsWith("/estadisticas") ? stylesNavbar.pagina_activa : ""}>📊</li>
                </ul>
            </div>
            <div className={stylesNavbar.navbar_info}>
                <ul>
                    <ThemeSwitcher />
                    <li onClick={() => setActivePopup("reportar-eyl")} className={stylesNavbar.navbar_report}>❌</li>
                    {activePopup === "reportar-eyl" && (
                        <Popup onClose={() => setActivePopup(null)}>
                            <h2>Reportar errores</h2>
                            <p>
                                Si encuentras algún error en el funcionamiento del sitio, puedes
                                usar este formulario para reportarlo. Puedes enviar un reporte por
                                día. Al enviar el reporte, se abrirá una pestaña de Google Forms,
                                que es el servicio que utilizamos. Es totalmente anónimo.
                            </p>
                            <div className={stylesNavbar.reportar_eyl_form}>
                                <div className={stylesNavbar.reportar_eyl_form_inputs}>
                                    <form
                                    action="https://docs.google.com/forms/d/e/1FAIpQLSfHE1YEpt1XLPOlbxV_cWI4-4VAKARRzWI7SRW5UKkTA_dewQ/formResponse"
                                    method="POST"
                                    target="_blank"
                                    onSubmit={(e) => {
                                        if (!canSendReport()) {
                                            e.preventDefault();
                                            alert("Sólo puede enviarse un reporte por día. Inténtalo de nuevo mañana.");
                                            return;
                                        }
                                        recordReport();
                                    }}
                                    >
                                        <label htmlFor="reporte-tipo">Tipo de error: <span className={stylesNavbar.error_asterisk}>*</span></label>
                                        <select name="entry.1658570772" id="reporte-tipo" required>
                                            <option value="" disabled selected>Selecciona una opción</option>
                                            <option value="Página no encontrada (404)">Página no encontrada (404)</option>
                                            <option value="Tipografía (ortografía/gramática)">Tipografía (ortografía/gramática)</option>
                                            <option value="Estilo (PC)">Estilo (PC)</option>
                                            <option value="Estilo (teléfonos)">Estilo (teléfonos)</option>
                                            <option value="Otro">Otro</option>
                                        </select>

                                        <label htmlFor="reporte-navegador">Navegador usado: <span className={stylesNavbar.error_asterisk}>*</span></label>
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

                                        <label htmlFor="reportar-mensaje">Explicación del error: <span className={stylesNavbar.error_asterisk}>*</span></label>
                                        <textarea name="entry.440380913" id="reportar-mensaje" placeholder="Describe paso a paso cómo ocurrió el error." required/>

                                        <select name="entry.1024505677" id="reporte-estado" className={stylesNavbar.reportar_form_hidden} required>
                                            <option value="Faltante" selected>Faltante</option>
                                        </select>

                                        <select name="entry.377379088" id="reporte-origen" className={stylesNavbar.reportar_form_hidden} required>
                                            <option value="Externo" selected>Externo</option>
                                        </select>

                                        <button className={stylesNavbar.send_report_button} type="submit">Enviar reporte</button>
                                    </form>
                                </div>
                            </div>
                        </Popup>
                    )}
                    <li onClick={() => setActivePopup("sobre-eyl")}>ℹ️</li>
                    {activePopup === "sobre-eyl" && (
                        <Popup onClose={() => setActivePopup(null)}>
                            <h2>Sobre la Biblioteca</h2>
                            <p>
                                Este sitio web ofrece un buscador, un índice y estadísticas sobre todos los libros de la Biblioteca.
                                Está creado con <a href="https://nextjs.org/" target="_blank">Next.js</a> (usando TypeScript) y
                                alojado en <a href="https://pages.github.com/" target="_blank">GitHub Pages</a>;
                                puedes ver el código fuente <a href="https://github.com/EscrituraYLectura/biblioteca">aquí</a>.
                                Usamos Google Drive para guardar los datos de los libros; puedes ver
                                el archivo <a href="https://docs.google.com/spreadsheets/d/1KzBwhtz-t_5i1V9vl6FdALE17SM_5Ep9sKwWG2jN-hM/edit?usp=sharing" target="_blank">aquí</a>.
                                El estilo es una imitación del <a href="https://discord.com/branding" target="_blank">estilo de Discord</a>.
                                Los datos fueron actualizados por última vez el <b>11 de marzo de 2026</b>.
                            </p>
                        </Popup>
                    )}
                </ul>
            </div>
        </nav>
    );
}
