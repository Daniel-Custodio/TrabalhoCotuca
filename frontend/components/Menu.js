import Link from 'next/link';

// Menu do topo com os links das páginas
export default function Menu() {
  return (
    <nav className="menu">
      <Link href="/">Início</Link>
      <Link href="/usuarios">Usuários</Link>
      <Link href="/laboratorios">Laboratórios</Link>
      <Link href="/salas">Salas</Link>
      <Link href="/status">Status</Link>
    </nav>
  );
}
