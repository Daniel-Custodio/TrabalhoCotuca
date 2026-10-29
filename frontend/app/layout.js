import './globals.css';
import Menu from '../components/Menu';
import Protecao from '../components/Protecao';

export const metadata = {
  title: 'Reserva de Laboratorios e Salas',
  description: 'Sistema de reserva de laboratorios e salas de aula',
};

// Estrutura de todas as paginas: topo com menu, conteudo (so com login) e rodape
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topo">
          <div className="titulo-site">Sistema de Reserva de Laboratorios e Salas</div>
          <Menu />
        </header>
        <main className="conteudo">
          <Protecao>{children}</Protecao>
        </main>
        <footer className="rodape">Pratica Profissional - 2o semestre - 2026</footer>
      </body>
    </html>
  );
}
