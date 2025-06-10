import TableFetch from '@/components/TableFetch';
import TopBar from '@/components/Topbar';
import NavBar from '@/components/Navbar';
import { Suspense } from 'react';

export default function Buscador() {
    return (
        <>
            <TopBar />
            <main className="contenedor">
                <NavBar />
                <Suspense>
                    <TableFetch />
                </Suspense>
            </main>
        </>
    );
}
