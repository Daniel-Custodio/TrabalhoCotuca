'use client';
import { useEffect, useState } from 'react';
import { listar, cadastrar, excluir } from '../../lib/api';
import { usuarioLogado } from '../../lib/sessao';
import { dataBR } from '../../lib/formato';

// Data de hoje no formato AAAA-MM-DD (para nao deixar escolher um dia que ja passou)
function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const formVazio = { tipo_recurso: 'L', recurso_id: '', data_inicial: '', data_final: '', hora_inicial: '', hora_final: '' };
const filtroVazio = { recurso: '', data: '', hora: '', usuario_id: '', status_id: '' };

// Tela de reservas: fazer uma reserva e consultar as reservas
export default function Reservas() {
  const [usuario, setUsuario] = useState(null);
  const [laboratorios, setLaboratorios] = useState([]);
  const [salas, setSalas] = useState([]);
  const [listaStatus, setListaStatus] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [statusId, setStatusId] = useState('');
  const [filtro, setFiltro] = useState(filtroVazio);
  const [mensagem, setMensagem] = useState(null);

  // Carrega laboratorios, salas, status e usuarios para as listas de escolha
  useEffect(() => {
    setUsuario(usuarioLogado());
    Promise.all([listar('/Laboratorio'), listar('/Sala'), listar('/Status'), listar('/Usuario')])
      .then(([labs, sls, sts, uss]) => {
        setLaboratorios(labs);
        setSalas(sls);
        setListaStatus(sts);
        setUsuarios(uss);
        const reservado = sts.find((s) => s.codigo === 'RESERVADO'); // situacao padrao de uma reserva nova
        if (reservado) setStatusId(String(reservado.id));
      })
      .catch((e) => setMensagem({ tipo: 'erro', texto: e.message }));
  }, []);

  // Busca as reservas na API com os filtros escolhidos (GET /Reserva?data=...)
  async function carregarReservas() {
    const parametros = new URLSearchParams();
    if (filtro.recurso) {
      const [tipo, id] = filtro.recurso.split('-'); // ex.: "L-2" = laboratorio de id 2
      parametros.set('tipo_recurso', tipo);
      parametros.set('recurso_id', id);
    }
    if (filtro.data) parametros.set('data', filtro.data);
    if (filtro.hora) parametros.set('hora', filtro.hora);
    if (filtro.usuario_id) parametros.set('usuario_id', filtro.usuario_id);
    if (filtro.status_id) parametros.set('status_id', filtro.status_id);
    try {
      setReservas(await listar(`/Reserva?${parametros}`));
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }
  useEffect(() => {
    carregarReservas();
  }, [filtro]);

  // Faz a reserva (POST /Reserva); a API recusa se o horario ja estiver ocupado
  async function reservar(e) {
    e.preventDefault();
    try {
      await cadastrar('/Reserva', {
        ...form,
        data_final: form.data_final || form.data_inicial, // sem "ate o dia" = um dia so
        status_id: statusId,
        usuario_id: usuario.id,
      });
      setMensagem({ tipo: 'ok', texto: 'Reserva feita com sucesso!' });
      setForm({ ...formVazio, tipo_recurso: form.tipo_recurso });
      carregarReservas();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  // Cancela a reserva (DELETE /Reserva/:id)
  async function cancelar(r) {
    if (!confirm(`Cancelar a reserva de ${r.recurso_codigo} no dia ${dataBR(r.data_inicial)}?`)) return;
    try {
      await excluir('/Reserva', r.id);
      setMensagem({ tipo: 'ok', texto: 'Reserva cancelada.' });
      carregarReservas();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  const recursos = form.tipo_recurso === 'L' ? laboratorios : salas;
  const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) });
  const campoFiltro = (nome) => ({ value: filtro[nome], onChange: (e) => setFiltro({ ...filtro, [nome]: e.target.value }) });

  return (
    <div>
      <h1>Reservas</h1>
      <p className="ajuda">
        Escolha o laboratorio ou a sala, o dia e o horario. Se o horario ja estiver reservado, o sistema avisa e nao deixa reservar.
      </p>

      <form onSubmit={reservar} className="formulario">
        <h2>Nova reserva</h2>

        <div className="campo">
          <label>O que voce quer reservar? *</label>
          <select value={form.tipo_recurso} onChange={(e) => setForm({ ...form, tipo_recurso: e.target.value, recurso_id: '' })}>
            <option value="L">Laboratorio</option>
            <option value="S">Sala de aula</option>
          </select>
        </div>

        <div className="campo">
          <label>{form.tipo_recurso === 'L' ? 'Qual laboratorio? *' : 'Qual sala? *'}</label>
          <select required {...campo('recurso_id')}>
            <option value="">Escolha...</option>
            {recursos.map((r) => (
              <option key={r.id} value={r.id}>{r.codigo} - {r.nome} ({r.capacidade} lugares)</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Dia *</label>
          <input type="date" required min={hoje()} {...campo('data_inicial')} />
        </div>

        <div className="campo">
          <label>Ate o dia (preencha so se for mais de um dia)</label>
          <input type="date" min={form.data_inicial || hoje()} {...campo('data_final')} />
        </div>

        <div className="campo">
          <label>Das (hora de inicio) *</label>
          <input type="time" required {...campo('hora_inicial')} />
        </div>

        <div className="campo">
          <label>Ate (hora de fim) *</label>
          <input type="time" required {...campo('hora_final')} />
        </div>

        <div className="campo">
          <label>Situacao da reserva</label>
          <select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
            {listaStatus.filter((s) => s.codigo !== 'LIVRE').map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>

        <p>Reserva no nome de: <b>{usuario ? `${usuario.nome} (${usuario.login})` : '-'}</b></p>
        <p className="obrigatorio">* campo obrigatorio</p>
        <button type="submit" className="btn-salvar">Reservar</button>
      </form>

      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      <h2>Consultar reservas ({reservas.length})</h2>
      <div className="filtros">
        <div>
          <label>Laboratorio ou sala</label>
          <select {...campoFiltro('recurso')}>
            <option value="">Todos</option>
            {laboratorios.map((l) => <option key={`L-${l.id}`} value={`L-${l.id}`}>{l.codigo} - {l.nome}</option>)}
            {salas.map((s) => <option key={`S-${s.id}`} value={`S-${s.id}`}>{s.codigo} - {s.nome}</option>)}
          </select>
        </div>
        <div>
          <label>Dia</label>
          <input type="date" {...campoFiltro('data')} />
        </div>
        <div>
          <label>Horario</label>
          <input type="time" {...campoFiltro('hora')} />
        </div>
        <div>
          <label>Quem reservou</label>
          <select {...campoFiltro('usuario_id')}>
            <option value="">Todos</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
        <div>
          <label>Situacao</label>
          <select {...campoFiltro('status_id')}>
            <option value="">Todas</option>
            {listaStatus.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <button type="button" className="btn-cancelar" onClick={() => setFiltro(filtroVazio)}>Limpar filtros</button>
      </div>

      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Laboratorio / Sala</th>
              <th>Dia</th>
              <th>Horario</th>
              <th>Reservado por</th>
              <th>Situacao</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 && <tr><td colSpan={6}>Nenhuma reserva encontrada.</td></tr>}
            {reservas.map((r) => (
              <tr key={r.id}>
                <td>{r.recurso_codigo} - {r.recurso_nome}</td>
                <td>{r.data_inicial === r.data_final ? dataBR(r.data_inicial) : `${dataBR(r.data_inicial)} a ${dataBR(r.data_final)}`}</td>
                <td>{r.hora_inicial} as {r.hora_final}</td>
                <td>{r.usuario_nome}</td>
                <td>{r.status_nome}</td>
                <td>
                  {usuario && r.usuario_id === usuario.id && (
                    <button type="button" className="btn-excluir" onClick={() => cancelar(r)}>Cancelar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
