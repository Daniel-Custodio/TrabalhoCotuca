'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listar, cadastrar, atualizar, excluir } from '../lib/api';
import { mascaras, dataBR, dataHoraBR, semAcento } from '../lib/formato';

// Texto que aparece na tabela (tambem usado na busca)
function texto(f, item) {
  const v = item[f.name];
  if (v === null || v === undefined || v === '') return f.vazio || '-';
  if (f.type === 'date') return dataBR(v);
  if (f.show === 'datahora') return dataHoraBR(v);
  if (f.mask) return mascaras[f.mask](v);
  return String(v);
}

// Tela de cadastro usada por Usuarios, Laboratorios, Salas, Status e Criar conta.
// fields: { name, label, coluna, type, required, maxLength, hint, mask, show, vazio,
//           createOnly (bloqueado na edicao), createOnlyRequired (obrigatorio so no cadastro),
//           formOnly (so no formulario), listOnly (so na tabela) }
// semTabela: mostra so o formulario | irPara: pagina para ir depois de cadastrar
export default function CrudPage({ modulo, fields, titulo, descricao, semTabela, irPara }) {
  const router = useRouter();
  const { endpoint, singular } = modulo;
  const formFields = fields.filter((f) => !f.listOnly);
  const columns = fields.filter((f) => !f.formOnly);
  const vazio = Object.fromEntries(formFields.map((f) => [f.name, '']));

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editingId, setEditingId] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [busca, setBusca] = useState('');

  // Busca a lista na API
  async function carregar() {
    try {
      setItems(await listar(endpoint));
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }
  useEffect(() => {
    if (!semTabela) carregar();
  }, []);

  // Coloca os dados do registro no formulario para editar
  function editar(item) {
    const dados = { ...vazio };
    formFields.forEach((f) => {
      if (f.formOnly) return;
      let v = item[f.name] ?? '';
      if (f.type === 'date') v = String(v).slice(0, 10);
      if (f.mask) v = mascaras[f.mask](v);
      dados[f.name] = v;
    });
    setForm(dados);
    setEditingId(item.id);
    setMensagem(null);
    window.scrollTo(0, 0);
  }

  function cancelar() {
    setForm(vazio);
    setEditingId(null);
  }

  // Cadastra (POST) ou salva a edicao (PUT)
  async function salvar(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await atualizar(endpoint, editingId, form);
        setMensagem({ tipo: 'ok', texto: 'Alteracoes salvas.' });
      } else {
        await cadastrar(endpoint, form);
        if (irPara) {
          alert('Cadastro feito! Agora entre com seu login e sua senha.');
          router.push(irPara);
          return;
        }
        setMensagem({ tipo: 'ok', texto: 'Cadastro salvo com sucesso.' });
      }
      cancelar();
      carregar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  // Exclui (DELETE) depois de confirmar
  async function remover(item) {
    if (!confirm(`Excluir ${singular} "${item.nome}"?`)) return;
    try {
      await excluir(endpoint, item.id);
      setMensagem({ tipo: 'ok', texto: 'Registro excluido.' });
      if (editingId === item.id) cancelar();
      carregar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  const termo = semAcento(busca.trim());
  const visiveis = termo
    ? items.filter((item) => columns.some((f) => semAcento(texto(f, item)).includes(termo)))
    : items;

  return (
    <div>
      <h1>{titulo || modulo.titulo}</h1>
      <p className="ajuda">{descricao || modulo.descricao}</p>

      <form onSubmit={salvar} className="formulario">
        {!semTabela && <h2>{editingId ? `Editando ${singular}` : `Cadastrar ${singular}`}</h2>}

        {formFields.map((f) => {
          const required = f.required && !(editingId && f.createOnlyRequired);
          return (
            <div className="campo" key={f.name}>
              <label>{f.label}{required && ' *'}</label>
              <input
                type={f.type || 'text'}
                value={form[f.name]}
                required={required}
                disabled={Boolean(editingId && f.createOnly)}
                min={f.type === 'number' ? 1 : undefined}
                maxLength={f.maxLength}
                placeholder={editingId && f.type === 'password' ? 'Deixe em branco para manter a senha' : f.hint || ''}
                onChange={(e) => {
                  const v = f.mask ? mascaras[f.mask](e.target.value) : e.target.value;
                  setForm({ ...form, [f.name]: v });
                }}
              />
            </div>
          );
        })}

        <p className="obrigatorio">* campo obrigatorio</p>
        <button type="submit" className="btn-salvar">{editingId ? 'Salvar alteracoes' : 'Cadastrar'}</button>
        {editingId && <button type="button" className="btn-cancelar" onClick={cancelar}>Cancelar</button>}
      </form>

      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      {!semTabela && (
        <>
          <h2>{modulo.titulo} cadastrados ({items.length})</h2>
          <input className="busca" placeholder="Digite para procurar..." value={busca} onChange={(e) => setBusca(e.target.value)} />

          <div className="tabela">
            <table>
              <thead>
                <tr>
                  {columns.map((f) => <th key={f.name}>{f.coluna || f.label}</th>)}
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.length === 0 && (
                  <tr><td colSpan={columns.length + 1}>Nenhum registro encontrado.</td></tr>
                )}
                {visiveis.map((item) => (
                  <tr key={item.id}>
                    {columns.map((f) => <td key={f.name}>{texto(f, item)}</td>)}
                    <td>
                      <button type="button" className="btn-editar" onClick={() => editar(item)}>Editar</button>
                      <button type="button" className="btn-excluir" onClick={() => remover(item)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
