import { useEffect, useState } from "react";

export default function mobileDetection(maxWidth = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= maxWidth);
        };

        checkScreenSize();

        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, [maxWidth]);

    return isMobile;
}
