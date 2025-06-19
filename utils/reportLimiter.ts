export function puedeEnviarReporte(): boolean {
    const LIMITE = 1;
    const hoy = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const data = JSON.parse(localStorage.getItem("reportesEnviados") || "{}");

    if (data[hoy] && data[hoy] >= LIMITE) {
        return false;
    }

    return true;
}

export function registrarReporte(): void {
    const hoy = new Date().toISOString().slice(0, 10);

    const data = JSON.parse(localStorage.getItem("reportesEnviados") || "{}");
    data[hoy] = (data[hoy] || 0) + 1;

    localStorage.setItem("reportesEnviados", JSON.stringify(data));
}
