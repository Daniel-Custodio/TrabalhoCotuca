import Link from 'next/link';

const cards = [
  { href: '/usuarios', title: 'Usuarios', text: 'Cadastro de usuarios com login e senha' },
  { href: '/laboratorios', title: 'Laboratorios', text: 'Recursos que podem ser reservados' },
  { href: '/salas', title: 'Salas de Aula', text: 'Recursos que podem ser reservados' },
  { href: '/status', title: 'Status', text: 'Livre, Ocupado, Bloqueado e Reservado' },
];

export default function Home() {
  return (
    <div>
      <h1>Sistema de Reserva de Laboratorios e Salas de Aula</h1>
      <p className="muted">Entrega 1: cadastros de usuarios, laboratorios, salas e status.</p>
      <div className="cards">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card link-card">
            <h2>{c.title}</h2>
            <p>{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
