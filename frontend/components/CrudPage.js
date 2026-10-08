'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

// fields: { name, label, type, required, formOnly, createOnly, hint }
export default function CrudPage({ title, endpoint, fields }) {
  const empty = Object.fromEntries(fields.map((f) => [f.name, '']));
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await api(endpoint));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  const fmt = (f, v) => {
    if (v === null || v === undefined) return '';
    if (f.type === 'date') return String(v).slice(0, 10).split('-').reverse().join('/');
    return String(v);
  };

  function edit(item) {
    const next = { ...empty };
    fields.forEach((f) => {
      if (f.formOnly) return;
      next[f.name] = f.type === 'date' ? String(item[f.name] || '').slice(0, 10) : item[f.name] ?? '';
    });
    setForm(next);
    setEditingId(item.id);
    setMsg(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancel() {
    setForm(empty); setEditingId(null); setError('');
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      if (editingId) {
        await api(`${endpoint}/${editingId}`, { method: 'PUT', body: form });
        setMsg('Registro atualizado com sucesso.');
      } else {
        await api(endpoint, { method: 'POST', body: form });
        setMsg('Registro cadastrado com sucesso.');
      }
      cancel();
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(item) {
    if (!confirm('Deseja realmente excluir este registro?')) return;
    setMsg(''); setError('');
    try {
      await api(`${endpoint}/${item.id}`, { method: 'DELETE' });
      setMsg('Registro excluido.');
      if (editingId === item.id) cancel();
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const columns = fields.filter((f) => !f.formOnly);

  return (
    <div>
      <h1>{title}</h1>
      {msg && <div className="alert ok">{msg}</div>}
      {error && <div className="alert err">{error}</div>}

      <form onSubmit={submit} className="card form-grid">
        <h2 className="full">{editingId ? 'Editar registro' : 'Novo registro'}</h2>
        {fields.map((f) => {
          const disabled = editingId && f.createOnly;
          const required = f.required && !(editingId && f.createOnlyRequired);
          return (
            <label key={f.name}>
              {f.label}{required ? ' *' : ''}
              <input
                type={f.type || 'text'}
                value={form[f.name]}
                required={required}
                disabled={disabled}
                min={f.type === 'number' ? 1 : undefined}
                maxLength={f.maxLength}
                placeholder={editingId && f.type === 'password' ? 'Deixe em branco para manter' : f.hint || ''}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
            </label>
          );
        })}
        <div className="full actions">
          <button type="submit" className="btn primary">{editingId ? 'Salvar alteracoes' : 'Cadastrar'}</button>
          {editingId && <button type="button" className="btn" onClick={cancel}>Cancelar</button>}
        </div>
      </form>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((f) => <th key={f.name}>{f.label}</th>)}
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="empty">Nenhum registro cadastrado.</td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((f) => <td key={f.name}>{fmt(f, item[f.name])}</td>)}
                <td className="row-actions">
                  <button className="btn small" onClick={() => edit(item)}>Editar</button>
                  <button className="btn small danger" onClick={() => remove(item)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
