'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usuarioLogado, sair } from '../lib/sessao';

// Menu do topo: links das paginas e quem esta logado
export default function Menu() {
  const caminho = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  // Le o usuario logado sempre que muda de pagina
  useEffect(() => {
    setUsuario(usuarioLogado());
  }, [caminho]);

  function deslogar() {
    sair();
    setUsuario(null);
    router.push('/login');
  }

  // Ninguem logado: so as opcoes de entrar e de criar conta
  if (!usuario) {
    return (
      <nav className="menu">
        <Link href="/login">Entrar</Link>
        <Link href="/cadastro">Criar conta</Link>
      </nav>
    );
  }

  return (
    <nav className="menu">
      <Link href="/">Inicio</Link>
      <Link href="/reservas">Reservas</Link>
      <Link href="/laboratorios">Laboratorios</Link>
      <Link href="/salas">Salas</Link>
      <Link href="/usuarios">Usuarios</Link>
      <Link href="/status">Status</Link>
      <span className="usuario-logado">Logado como {usuario.login}</span>
      <button type="button" className="btn-sair" onClick={deslogar}>Sair</button>
    </nav>
  );
}
