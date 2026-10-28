// Controller de status: valida os dados, chama o model e monta a resposta
const { conectar } = require('../../config/database.js');
const StatusCRUD = require('../model/Status.js');
const { lerId, validarStatus } = require('./validacoes.js');
const { ErroHttp, tratarErro } = require('./erros.js');

class StatusController {
    // GET /Status: lista todos
    listarTodos() {
        return async function (request, response) {
            try {
                const model = new StatusCRUD(await conectar());
                const resultado = await model.listarTodos();
                response.json(resultado.recordset); // recordset = linhas do SELECT
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao listar os status.');
            }
        };
    }

    // GET /Status/:id: busca pelo id
    buscarPorID() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new StatusCRUD(await conectar());
                const resultado = await model.buscarPorID(id);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Status nao encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar o status.');
            }
        };
    }

    // POST /Status: cadastra e devolve o registro criado (201)
    inserir() {
        return async function (request, response) {
            try {
                const status = validarStatus(request.body);
                const model = new StatusCRUD(await conectar());
                const resultado = await model.inserir(status);
                response.status(201).json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao cadastrar o status.');
            }
        };
    }

    // PUT /Status/:id: altera e devolve o registro alterado
    atualizar() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const status = validarStatus(request.body);
                const model = new StatusCRUD(await conectar());
                const resultado = await model.atualizar(id, status);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Status nao encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao alterar o status.');
            }
        };
    }

    // DELETE /Status/:id: exclui (409 se alguma reserva usa o status)
    excluir() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new StatusCRUD(await conectar());
                const resultado = await model.excluir(id);
                if (!resultado.rowsAffected[0]) throw new ErroHttp(404, 'Status nao encontrado.');
                response.json({ mensagem: 'Status excluido com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao excluir o status.');
            }
        };
    }
}

module.exports = StatusController;
