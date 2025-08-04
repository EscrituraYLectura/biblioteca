"use client";

//import type { Metadata } from "next";
import "@/styles/global.scss";
import { useEffect, useState } from "react";

/*export const metadata: Metadata = {
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
}*/

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState("Light");

    useEffect(() => {
        const saved = localStorage.getItem("tema");
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        document.documentElement.className = `tema${theme}`;
    }, [theme]);

    return (
        <html lang="es">
            <body>
                {children}
            </body>
        </html>
    );
}