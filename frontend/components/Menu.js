'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { listaModulos } from '../lib/modulos';

export default function Menu() {
  const path = usePathname();

  return (
    <aside className="lateral">
      <Link href="/" className="marca">
        <span className="marca-icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="4.5" />
            <path d="M10.7 12.3 20 3M16 7l3 3M18.5 4.5l2 2" />
          </svg>
        </span>
        <span>
          <strong>Reserva</strong>
          <small>laboratórios &amp; salas</small>
        </span>
      </Link>

      <nav className="menu">
        <Link href="/" className={path === '/' ? 'ativo' : ''}><span>00</span>Painel</Link>
        <p className="menu-grupo">Cadastros</p>
        {listaModulos.map((m) => (
          <Link key={m.href} href={m.href} className={path.startsWith(m.href) ? 'ativo' : ''}>
            <span>{m.num}</span>{m.titulo}
          </Link>
        ))}
      </nav>

      <p className="lateral-rodape">Prática Profissional<br />2º semestre · 2026</p>
    </aside>
  );
}
