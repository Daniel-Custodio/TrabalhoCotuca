'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listar } from '../lib/api';
import { listaModulos } from '../lib/modulos';

// Pagina inicial: mostra quantos registros cada cadastro tem
export default function Inicio() {
  const [totais, setTotais] = useState({});
  const [online, setOnline] = useState(null);

  useEffect(() => {
    Promise.allSettled(listaModulos.map((m) => listar(m.endpoint))).then((respostas) => {
      const t = {};
      respostas.forEach((r, i) => {
        if (r.status === 'fulfilled') t[listaModulos[i].endpoint] = r.value.length;
      });
      setTotais(t);
      setOnline(respostas.some((r) => r.status === 'fulfilled'));
    });
  }, []);

  return (
    <div>
      <h1>Bem-vindo</h1>
      <p>Escolha um cadastro:</p>

      <table>
        <thead>
          <tr>
            <th>Cadastro</th>
            <th>Quantidade</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listaModulos.map((m) => (
            <tr key={m.href}>
              <td>{m.titulo}</td>
              <td>{totais[m.endpoint] ?? '-'}</td>
              <td><Link href={m.href}>Abrir</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      {online === true && <p className="mensagem ok">API conectada.</p>}
      {online === false && <p className="mensagem erro">A API esta fora do ar. Rode "npm start" na pasta do projeto.</p>}
    </div>
  );
}
