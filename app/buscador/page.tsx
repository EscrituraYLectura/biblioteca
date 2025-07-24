import GenerateTable from "@/components/GenerateTable";
import TopBar from "@/components/Topbar";
import NavBar from "@/components/Navbar";
import { Suspense } from "react";

export default function Searcher() {
    return (
        <>
            <TopBar />
            <main className="contenedor">
                <NavBar />
                <Suspense>
                    <GenerateTable />
                </Suspense>
            </main>
        </>
    );
}
