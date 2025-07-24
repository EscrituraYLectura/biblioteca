import GenerateGraphics from "@/components/GenerateGraphics";
import TopBar from "@/components/Topbar";
import NavBar from "@/components/Navbar";
import { Suspense } from "react";

export default function Statistics() {
    return (
        <>
            <TopBar />
            <main className="contenedor">
                <NavBar />
                <Suspense>
                    <GenerateGraphics />
                </Suspense>
            </main>
        </>
    );
}
