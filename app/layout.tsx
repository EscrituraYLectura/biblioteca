import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Escritura y Lectura',
  description: 'Sitio web oficial del servidor Escritura y Lectura.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
