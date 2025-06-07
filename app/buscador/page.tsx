import TableFetch from '@/components/TableFetch';
import TopBar from '@/components/topbar';
import NavBar from '@/components/navbar';
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
