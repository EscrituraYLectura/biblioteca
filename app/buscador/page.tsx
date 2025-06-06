import TableFetch from '@/components/TableFetch';
import NavBar from '@/components/navbar';
import TopBar from '@/components/topbar';
import { Suspense } from 'react';

export default function Home() {
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
