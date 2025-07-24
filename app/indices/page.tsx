import GenerateIndex from "@/components/GenerateIndex";
import TopBar from "@/components/Topbar";
import NavBar from "@/components/Navbar";
import { Suspense } from "react";

export default function Index() {
    return (
        <>
            <TopBar />
            <main className="contenedor">
                <NavBar />
                <Suspense>
                    <GenerateIndex />
                </Suspense>
            </main>
        </>
    );
}
