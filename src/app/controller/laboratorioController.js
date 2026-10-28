// Controller de laboratorio: valida os dados, chama o model e monta a resposta
const { conectar } = require('../../config/database.js');
const LaboratorioCRUD = require('../model/Laboratorio.js');
const { lerId, validarRecurso } = require('./validacoes.js');
const { ErroHttp, tratarErro } = require('./erros.js');

class LaboratorioController {
    // GET /Laboratorio: lista todos
    listarTodos() {
        return async function (request, response) {
            try {
                const model = new LaboratorioCRUD(await conectar());
                const resultado = await model.listarTodos();
                response.json(resultado.recordset); // recordset = linhas do SELECT
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao listar os laboratorios.');
            }
        };
    }

    // GET /Laboratorio/:id: busca pelo id
    buscarPorID() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new LaboratorioCRUD(await conectar());
                const resultado = await model.buscarPorID(id);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Laboratorio nao encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar o laboratorio.');
            }
        };
    }

    // POST /Laboratorio: cadastra e devolve o registro criado (201)
    inserir() {
        return async function (request, response) {
            try {
                const laboratorio = validarRecurso(request.body);
                const model = new LaboratorioCRUD(await conectar());
                const resultado = await model.inserir(laboratorio);
                response.status(201).json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao cadastrar o laboratorio.');
            }
        };
    }

    // PUT /Laboratorio/:id: altera e devolve o registro alterado
    atualizar() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const laboratorio = validarRecurso(request.body);
                const model = new LaboratorioCRUD(await conectar());
                const resultado = await model.atualizar(id, laboratorio);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Laboratorio nao encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao alterar o laboratorio.');
            }
        };
    }

    // DELETE /Laboratorio/:id: exclui
    excluir() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new LaboratorioCRUD(await conectar());
                const resultado = await model.excluir(id);
                if (!resultado.rowsAffected[0]) throw new ErroHttp(404, 'Laboratorio nao encontrado.');
                response.json({ mensagem: 'Laboratorio excluido com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao excluir o laboratorio.');
            }
        };
    }
}

module.exports = LaboratorioController;
