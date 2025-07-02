"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import stylesTooltip from "@/styles/components/tooltip.module.scss";

interface TooltipProps {
    text: React.ReactNode;
    children: React.ReactNode;
}

export function TooltipInternal({ text, children }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const show = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setVisible(true);
    };

    const hide = () => {
        timeoutRef.current = setTimeout(() => setVisible(false), 200);
    };

    useEffect(() => {
        if (visible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top + window.scrollY - 5,
                left: rect.left + rect.width / 2 + window.scrollX,
            });
        }
    }, [visible]);

    return (
        <>
            <span
                className={stylesTooltip.tooltip}
                ref={triggerRef}
                onMouseEnter={show}
                onMouseLeave={hide}
            >
                {text}
            </span>

            {visible &&
                createPortal(
                    <div
                        className={`${stylesTooltip.tooltip_text} ${visible ? stylesTooltip.visible : ""}`}
                        style={{
                            top: position.top,
                            left: position.left,
                            transform: "translate(-50%, -100%)",
                        }}
                        onMouseEnter={show}
                        onMouseLeave={hide}
                    >
                        {children}
                    </div>,
                    document.body
                )}
        </>
    );
}
