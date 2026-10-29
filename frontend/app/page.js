'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listar } from '../lib/api';
import { usuarioLogado } from '../lib/sessao';

// Pagina inicial: atalhos para o que a pessoa pode fazer no sistema
export default function Inicio() {
  const [usuario, setUsuario] = useState(null);
  const [apiFora, setApiFora] = useState(false);

  useEffect(() => {
    setUsuario(usuarioLogado());
    listar('/Status').catch(() => setApiFora(true)); // so para avisar se a API estiver desligada
  }, []);

  return (
    <div>
      <h1>Ola{usuario ? `, ${usuario.nome}` : ''}!</h1>
      <p className="ajuda">O que voce quer fazer?</p>

      <div className="opcoes">
        <Link href="/reservas" className="opcao principal">
          Reservar laboratorio ou sala
          <span>Escolha o dia e o horario e veja as reservas</span>
        </Link>
        <Link href="/laboratorios" className="opcao">
          Laboratorios
          <span>Cadastrar e ver os laboratorios</span>
        </Link>
        <Link href="/salas" className="opcao">
          Salas de aula
          <span>Cadastrar e ver as salas</span>
        </Link>
        <Link href="/usuarios" className="opcao">
          Usuarios
          <span>Pessoas que usam o sistema</span>
        </Link>
        <Link href="/status" className="opcao">
          Status das reservas
          <span>Livre, Reservado, Ocupado e Bloqueado</span>
        </Link>
      </div>

      {apiFora && <p className="mensagem erro">O sistema esta fora do ar: a API precisa estar ligada (npm start).</p>}
    </div>
  );
}
