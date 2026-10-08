import Link from 'next/link';
import './globals.css';

export const metadata = { title: 'Reserva de Laboratorios e Salas' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">Reserva de Recursos</Link>
          <nav>
            <Link href="/usuarios">Usuarios</Link>
            <Link href="/laboratorios">Laboratorios</Link>
            <Link href="/salas">Salas</Link>
            <Link href="/status">Status</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
