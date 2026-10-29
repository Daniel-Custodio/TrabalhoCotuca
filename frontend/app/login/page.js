'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { entrar } from '../../lib/api';
import { guardarLogin } from '../../lib/sessao';

// Tela de login: a API confere o login e a senha (POST /Login)
export default function Login() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  async function enviar(e) {
    e.preventDefault();
    try {
      const usuario = await entrar(login, senha);
      guardarLogin({ id: usuario.id, nome: usuario.nome, login: usuario.login });
      router.push('/');
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <h1>Entrar no sistema</h1>
      <p className="ajuda">Digite seu login e sua senha.</p>

      <form onSubmit={enviar} className="formulario">
        <div className="campo">
          <label>Login</label>
          <input value={login} onChange={(e) => setLogin(e.target.value)} required autoFocus />
        </div>
        <div className="campo">
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        <button type="submit" className="btn-salvar">Entrar</button>
      </form>

      {erro && <p className="mensagem erro">{erro}</p>}

      <p>Ainda nao tem conta? <Link href="/cadastro">Crie sua conta aqui</Link>.</p>
    </div>
  );
}
