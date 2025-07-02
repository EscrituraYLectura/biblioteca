import stylesTopbar from "@/styles/components/topbar.module.scss";

export default function TopBar() {
    return (
        <div className={stylesTopbar.topbar}>
            <img
                src="/biblioteca/icon.png"
                alt="Logo de Escritura y Lectura"
                width={20}
                height={20}
            />
            <p>Biblioteca de Escritura y Lectura</p>
        </div>
    );
}
