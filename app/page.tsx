import TopBar from '@/components/topbar';
import NavBar from '@/components/navbar';

export default function Home() {
    return (
        <>
            <TopBar />
            <main className="contenedor">
                <NavBar />
                <p>Página principal</p>
            </main>
        </>
    );
}
