import Link from 'next/link';

// Menu do topo com os links das paginas
export default function Menu() {
  return (
    <nav className="menu">
      <Link href="/">Inicio</Link>
      <Link href="/usuarios">Usuarios</Link>
      <Link href="/laboratorios">Laboratorios</Link>
      <Link href="/salas">Salas</Link>
      <Link href="/status">Status</Link>
    </nav>
  );
}
