// Controller de reserva: valida, confere se o horario esta livre e monta a resposta
const { conectar } = require('../../config/database.js');
const ReservaCRUD = require('../model/Reserva.js');
const { lerId, dataExiste, horaValida, validarReserva } = require('./validacoes.js');
const { ErroHttp, tratarErro } = require('./erros.js');

// Le os filtros da URL (ex.: /Reserva?data=2026-11-03&recurso_id=2); filtro vazio vira null
function lerFiltros(query) {
    const numero = (v) => (/^\d+$/.test(String(v ?? '')) ? Number(v) : null);
    const tipo = String(query.tipo_recurso ?? '').toUpperCase();
    return {
        tipo_recurso: tipo === 'L' || tipo === 'S' ? tipo : null,
        recurso_id: numero(query.recurso_id),
        data: dataExiste(String(query.data ?? '')) ? query.data : null,
        hora: horaValida(String(query.hora ?? '')) ? query.hora : null,
        usuario_id: numero(query.usuario_id),
        status_id: numero(query.status_id),
    };
}

// Mensagem de horario ocupado, ex.: "Esse horario ja esta reservado: 03/11/2026 das 14:00 as 16:00, por joao."
function mensagemConflito(c) {
    const br = (d) => d.split('-').reverse().join('/');
    const dias = c.data_inicial === c.data_final ? br(c.data_inicial) : `${br(c.data_inicial)} a ${br(c.data_final)}`;
    return `Esse horario ja esta reservado: ${dias} das ${c.hora_inicial} as ${c.hora_final}, por ${c.usuario_login || 'outro usuario'}.`;
}

class ReservaController {
    // GET /Reserva: lista as reservas (aceita filtros na URL)
    listarTodos() {
        return async function (request, response) {
            try {
                const model = new ReservaCRUD(await conectar());
                const resultado = await model.listar(lerFiltros(request.query));
                response.json(resultado.recordset);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao listar as reservas.');
            }
        };
    }

    // GET /Reserva/:id: busca pelo id
    buscarPorID() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new ReservaCRUD(await conectar());
                const resultado = await model.buscarPorID(id);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Reserva nao encontrada.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar a reserva.');
            }
        };
    }

    // POST /Reserva: reserva se o horario estiver livre (201), senao 409
    inserir() {
        return async function (request, response) {
            try {
                const reserva = validarReserva(request.body, true);
                const model = new ReservaCRUD(await conectar());
                if (!(await model.recursoExiste(reserva.tipo_recurso, reserva.recurso_id))) {
                    throw new ErroHttp(400, 'Laboratorio ou sala nao encontrado.');
                }
                const resultado = await model.inserir(reserva);
                if (resultado.conflito) throw new ErroHttp(409, mensagemConflito(resultado.conflito));
                const criada = await model.buscarPorID(resultado.id);
                response.status(201).json(criada.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao fazer a reserva.');
            }
        };
    }

    // PUT /Reserva/:id: altera (tambem confere se o novo horario esta livre)
    atualizar() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const reserva = validarReserva(request.body, false);
                const model = new ReservaCRUD(await conectar());
                const existente = await model.buscarPorID(id);
                if (!existente.recordset.length) throw new ErroHttp(404, 'Reserva nao encontrada.');
                if (!(await model.recursoExiste(reserva.tipo_recurso, reserva.recurso_id))) {
                    throw new ErroHttp(400, 'Laboratorio ou sala nao encontrado.');
                }
                const resultado = await model.atualizar(id, reserva);
                if (resultado.conflito) throw new ErroHttp(409, mensagemConflito(resultado.conflito));
                if (resultado.naoExiste) throw new ErroHttp(404, 'Reserva nao encontrada.');
                const alterada = await model.buscarPorID(id);
                response.json(alterada.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao alterar a reserva.');
            }
        };
    }

    // DELETE /Reserva/:id: cancela a reserva
    excluir() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new ReservaCRUD(await conectar());
                const resultado = await model.excluir(id);
                if (!resultado.rowsAffected[0]) throw new ErroHttp(404, 'Reserva nao encontrada.');
                response.json({ mensagem: 'Reserva cancelada.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao cancelar a reserva.');
            }
        };
    }
}

module.exports = ReservaController;
