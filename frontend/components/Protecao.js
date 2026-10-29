'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usuarioLogado } from '../lib/sessao';

// Paginas que abrem sem login
const PUBLICAS = ['/login', '/cadastro'];

// So mostra a pagina se a pessoa fez login; se nao fez, manda para a tela de login
export default function Protecao({ children }) {
  const caminho = usePathname();
  const router = useRouter();
  const [liberado, setLiberado] = useState(false);

  useEffect(() => {
    if (PUBLICAS.includes(caminho) || usuarioLogado()) {
      setLiberado(true);
    } else {
      setLiberado(false);
      router.replace('/login');
    }
  }, [caminho]);

  return liberado ? children : <p>Carregando...</p>;
}
