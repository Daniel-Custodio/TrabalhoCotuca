'use client';
import { useEffect, useState } from 'react';
import { listar, cadastrar, atualizar, excluir } from '../lib/api';
import { mascaras, dataBR, dataHoraBR, semAcento, classeStatus } from '../lib/formato';

// Texto que aparece na tabela (tambem usado pela busca)
function texto(f, item) {
  const v = item[f.name];
  if (v === null || v === undefined || v === '') return '';
  if (f.type === 'date') return dataBR(v);
  if (f.show === 'datahora') return dataHoraBR(v);
  if (f.mask) return mascaras[f.mask](v);
  return String(v);
}

function Celula({ f, item }) {
  const t = texto(f, item);
  if (!t) return <span className="vazio">{f.vazio || '—'}</span>;
  if (f.show === 'etiqueta') return <span className="etiqueta">{t}</span>;
  if (f.show === 'carimbo') return <span className={`carimbo ${classeStatus(item.codigo)}`}>{t}</span>;
  return <>{t}{f.suffix && <small className="sufixo"> {f.suffix}</small>}</>;
}

// modulo: dados do cadastro (lib/modulos.js)
// fields: { name, label, type, required, maxLength, hint, mask, show, suffix, vazio, wide,
//           createOnly, createOnlyRequired, formOnly (so no formulario), listOnly (so na tabela) }
export default function CrudPage({ modulo, fields }) {
  const { endpoint, num, titulo, texto: descricao, singular, novo } = modulo;
  const formFields = fields.filter((f) => !f.listOnly);
  const columns = fields.filter((f) => !f.formOnly);
  const empty = Object.fromEntries(formFields.map((f) => [f.name, '']));

  const [items, setItems] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [busca, setBusca] = useState('');

  async function load() {
    try {
      setItems(await listar(endpoint));
      setErroLista('');
    } catch (e) {
      setErroLista(e.message);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { load(); }, []);

  // O aviso some sozinho depois de alguns segundos
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  function edit(item) {
    const next = { ...empty };
    formFields.forEach((f) => {
      if (f.formOnly) return;
      let v = item[f.name] ?? '';
      if (f.type === 'date') v = String(v).slice(0, 10);
      if (f.mask) v = mascaras[f.mask](v);
      next[f.name] = v;
    });
    setForm(next);
    setEditingId(item.id);
    setErroForm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancel() {
    setForm(empty); setEditingId(null); setErroForm('');
  }

  async function submit(e) {
    e.preventDefault();
    setErroForm('');
    setSalvando(true);
    try {
      if (editingId) {
        await atualizar(endpoint, editingId, form);
        setAviso({ tipo: 'ok', texto: 'Alterações salvas.' });
      } else {
        await cadastrar(endpoint, form);
        setAviso({ tipo: 'ok', texto: 'Cadastro salvo com sucesso.' });
      }
      cancel();
      load();
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function remove(item) {
    if (!confirm(`Excluir ${singular} "${item.nome}"?`)) return;
    try {
      await excluir(endpoint, item.id);
      setAviso({ tipo: 'ok', texto: 'Registro excluído.' });
      if (editingId === item.id) cancel();
      load();
    } catch (e) {
      setAviso({ tipo: 'erro', texto: e.message });
    }
  }

  const termo = semAcento(busca.trim());
  const visiveis = termo
    ? items.filter((item) => columns.some((f) => semAcento(`${texto(f, item)} ${item[f.name] ?? ''}`).includes(termo)))
    : items;

  let mensagemVazia = '';
  if (carregando) mensagemVazia = 'Carregando…';
  else if (erroLista) mensagemVazia = erroLista;
  else if (!items.length) mensagemVazia = 'Nenhum registro ainda. Preencha a ficha acima para cadastrar o primeiro.';
  else if (!visiveis.length) mensagemVazia = `Nada encontrado para "${busca}".`;

  return (
    <div>
      <header className="cabecalho">
        <span className="sobretitulo">{num} · Cadastro</span>
        <h1><span className="marca-texto">{titulo}</span></h1>
        <p>{descricao}</p>
      </header>

      <form onSubmit={submit} className="ficha">
        <div className="ficha-topo">
          <h2>{editingId ? `Editando ${singular}` : novo}</h2>
          <span className="ficha-num">{editingId ? `ficha nº ${String(editingId).padStart(4, '0')}` : 'ficha nova'}</span>
        </div>

        <div className="campos">
          {formFields.map((f) => {
            const disabled = Boolean(editingId && f.createOnly);
            const required = f.required && !(editingId && f.createOnlyRequired);
            return (
              <label key={f.name} className={`campo${f.wide ? ' largo' : ''}`}>
                <span>{f.label}{required && <b> *</b>}</span>
                <input
                  type={f.type || 'text'}
                  value={form[f.name]}
                  required={required}
                  disabled={disabled}
                  min={f.type === 'number' ? 1 : undefined}
                  maxLength={f.maxLength}
                  inputMode={f.mask ? 'numeric' : undefined}
                  placeholder={editingId && f.type === 'password' ? 'Deixe em branco para manter' : f.hint || ''}
                  onChange={(e) => {
                    const v = f.mask ? mascaras[f.mask](e.target.value) : e.target.value;
                    setForm({ ...form, [f.name]: v });
                  }}
                />
              </label>
            );
          })}
        </div>

        {erroForm && <p className="ficha-erro" role="alert">{erroForm}</p>}

        <div className="ficha-acoes">
          <button type="submit" className="btn primario" disabled={salvando}>
            {salvando ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar'}
          </button>
          {editingId && <button type="button" className="btn" onClick={cancel}>Cancelar</button>}
        </div>
      </form>

      <section>
        <div className="lista-topo">
          <h2>Cadastrados <span className="contador">{String(items.length).padStart(2, '0')}</span></h2>
          <input
            type="search"
            className="busca"
            placeholder={`Buscar ${titulo.toLowerCase()}…`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label={`Buscar ${titulo.toLowerCase()}`}
          />
        </div>

        <div className="tabela">
          <table>
            <thead>
              <tr>
                {columns.map((f) => <th key={f.name}>{f.label}</th>)}
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {mensagemVazia ? (
                <tr><td colSpan={columns.length + 1} className={`linha-vazia${erroLista ? ' erro' : ''}`}>{mensagemVazia}</td></tr>
              ) : visiveis.map((item) => (
                <tr key={item.id} className={editingId === item.id ? 'editando' : ''}>
                  {columns.map((f) => (
                    <td key={f.name} className={f.wide ? 'longo' : f.show || f.type || f.mask ? '' : 'texto'}><Celula f={f} item={item} /></td>
                  ))}
                  <td>
                    <div className="acoes">
                      <button type="button" className="btn-texto" onClick={() => edit(item)}>Editar</button>
                      <button type="button" className="btn-texto perigo" onClick={() => remove(item)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {aviso && <div className={`aviso ${aviso.tipo}`} role="status">{aviso.texto}</div>}
    </div>
  );
}
