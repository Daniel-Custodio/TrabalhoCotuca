import './globals.css';
import Menu from '../components/Menu';

export const metadata = {
  title: 'Reserva de Laboratórios e Salas',
  description: 'Sistema de reserva de laboratórios e salas de aula',
};

// Estrutura de todas as páginas: topo com menu, conteúdo e rodapé
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topo">
          <div className="titulo-site">Sistema de Reserva de Laboratórios e Salas</div>
          <Menu />
        </header>
        <main className="conteudo">{children}</main>
        <footer className="rodape">Prática Profissional - 2º semestre - 2026</footer>
      </body>
    </html>
  );
}
