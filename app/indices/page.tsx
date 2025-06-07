import GenerateIndex from '@/components/GenerateIndex';
import TopBar from '@/components/topbar';
import NavBar from '@/components/navbar';
import { Suspense } from 'react';

export default function Indices() {
    return (
        <>
            <TopBar />
            <main className="contenedor-2">
                <NavBar />
                <Suspense>
                    <GenerateIndex />
                </Suspense>
            </main>
        </>
    );
}
