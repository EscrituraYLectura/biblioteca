export function canSendReport(): boolean {
    const LIMIT = 1;
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem("reportesEnviados") || "{}");

    if (data[today] && data[today] >= LIMIT) {
        return false;
    }

    return true;
}

export function recordReport(): void {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem("reportesEnviados") || "{}");
    data[today] = (data[today] || 0) + 1;

    localStorage.setItem("reportesEnviados", JSON.stringify(data));
}
