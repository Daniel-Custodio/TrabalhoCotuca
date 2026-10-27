// Controller de sala: valida os dados, chama o model e monta a resposta
const { conectar } = require('../../config/database.js');
const SalaCRUD = require('../model/Sala.js');
const { lerId, validarRecurso } = require('./validacoes.js');
const { ErroHttp, tratarErro } = require('./erros.js');

class SalaController {
    // GET /Sala: lista todas
    listarTodos() {
        return async function (request, response) {
            try {
                const model = new SalaCRUD(await conectar());
                const resultado = await model.listarTodos();
                response.json(resultado.recordset); // recordset = linhas do SELECT
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao listar as salas.');
            }
        };
    }

    // GET /Sala/:id: busca pelo id
    buscarPorID() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new SalaCRUD(await conectar());
                const resultado = await model.buscarPorID(id);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Sala não encontrada.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar a sala.');
            }
        };
    }

    // POST /Sala: cadastra e devolve o registro criado (201)
    inserir() {
        return async function (request, response) {
            try {
                const sala = validarRecurso(request.body);
                const model = new SalaCRUD(await conectar());
                const resultado = await model.inserir(sala);
                response.status(201).json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao cadastrar a sala.');
            }
        };
    }

    // PUT /Sala/:id: altera e devolve o registro alterado
    atualizar() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const sala = validarRecurso(request.body);
                const model = new SalaCRUD(await conectar());
                const resultado = await model.atualizar(id, sala);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Sala não encontrada.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao alterar a sala.');
            }
        };
    }

    // DELETE /Sala/:id: exclui
    excluir() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new SalaCRUD(await conectar());
                const resultado = await model.excluir(id);
                if (!resultado.rowsAffected[0]) throw new ErroHttp(404, 'Sala não encontrada.');
                response.json({ mensagem: 'Sala excluída com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao excluir a sala.');
            }
        };
    }
}

module.exports = SalaController;
