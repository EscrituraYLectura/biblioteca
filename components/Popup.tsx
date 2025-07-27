"use client";

import { useEffect, useRef } from "react";

interface PopupProps {
    children: React.ReactNode;
    onClose: () => void;
}

export default function Popup({ children, onClose }: PopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="popup_overlay">
            <div className="popup_box" ref={popupRef}>
                <button className="popup_close" onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
}
