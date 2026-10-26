import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import './globals.css';
import Menu from '../components/Menu';

export const metadata = {
  title: { default: 'Reserva de Laboratórios e Salas', template: '%s · Reserva de Laboratórios e Salas' },
  description: 'Sistema de reserva de laboratórios e salas de aula',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app">
          <Menu />
          <main className="conteudo">{children}</main>
        </div>
      </body>
    </html>
  );
}
