import TopBar from '@/components/Topbar';
import NavBar from '@/components/Navbar';

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
