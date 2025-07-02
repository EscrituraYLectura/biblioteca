import type { Metadata } from "next";
import "@/styles/global.scss";

export const metadata: Metadata = {
    title: "Biblioteca | Escritura y Lectura",
    description: "Sitio web oficial del servidor Escritura y Lectura.",
    icons: {
        icon: "/biblioteca/icon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}
