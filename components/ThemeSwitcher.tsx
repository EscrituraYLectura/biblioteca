"use client";

import { useEffect, useState } from "react";

const themes = ["Light", "Ash", "Dark", "Onyx"];

export default function ThemeSwitcher() {
    const [themeIndex, setThemeIndex] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem("tema");
        if (saved) {
            const index = themes.indexOf(saved);
            setThemeIndex(index >= 0 ? index : 0);
            document.documentElement.className = `tema${saved}`;
        }
    }, []);

    const handleClick = () => {
        const nextIndex = (themeIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        setThemeIndex(nextIndex);
        document.documentElement.className = `tema${nextTheme}`;
        localStorage.setItem("tema", nextTheme);
    };

    return (
        <li onClick={handleClick}>
            🎨
        </li>
    );
}
