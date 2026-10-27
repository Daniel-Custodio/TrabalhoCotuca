'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listar } from '../lib/api';
import { listaModulos, modulos } from '../lib/modulos';
import { classeStatus } from '../lib/formato';

// Painel inicial: um "quadro de chaves" com uma etiqueta para cada cadastro
export default function Painel() {
  const [dados, setDados] = useState({});
  const [online, setOnline] = useState(null);

  useEffect(() => {
    Promise.allSettled(listaModulos.map((m) => listar(m.endpoint))).then((rs) => {
      const d = {};
      rs.forEach((r, i) => { if (r.status === 'fulfilled') d[listaModulos[i].endpoint] = r.value; });
      setDados(d);
      setOnline(rs.some((r) => r.status === 'fulfilled'));
    });
  }, []);

  const status = dados[modulos.status.endpoint] || [];

  return (
    <div>
      <header className="cabecalho">
        <span className="sobretitulo">00 · Painel</span>
        <h1><span className="marca-texto">Reserva de laboratórios e salas de aula</span></h1>
        <p>Escolha um cadastro no quadro de chaves. Cada etiqueta mostra quantos registros já estão no banco.</p>
      </header>

      <section className="quadro" aria-label="Cadastros">
        {listaModulos.map((m) => {
          const lista = dados[m.endpoint];
          return (
            <Link key={m.href} href={m.href} className={`chave ${m.cor}`}>
              <span className="prego" aria-hidden="true" />
              <span className="chave-num">{m.num}</span>
              <strong>{m.titulo}</strong>
              <span className="chave-texto">{m.texto}</span>
              <span className="chave-total">
                {lista ? String(lista.length).padStart(2, '0') : '—'}
                <small>{lista ? 'cadastrados' : 'sem conexão'}</small>
              </span>
            </Link>
          );
        })}
      </section>

      {status.length > 0 && (
        <section className="legenda">
          <h2>Carimbos de status</h2>
          <ul>
            {status.map((s) => (
              <li key={s.id}>
                <span className={`carimbo ${classeStatus(s.codigo)}`}>{s.nome}</span>
                <p>{s.descricao || 'Sem descrição.'}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={`conexao ${online === null ? '' : online ? 'on' : 'off'}`}>
        <span className="ponto" />
        {online === null && 'Verificando conexão com a API…'}
        {online === true && 'API conectada'}
        {online === false && 'API fora do ar. Rode "npm start" na pasta backend.'}
      </p>
    </div>
  );
}
