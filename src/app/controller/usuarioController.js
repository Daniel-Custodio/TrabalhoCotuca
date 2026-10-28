// Controller de usuario: valida os dados, chama o model e monta a resposta
const bcrypt = require('bcryptjs');
const { conectar } = require('../../config/database.js');
const UsuarioCRUD = require('../model/Usuario.js');
const { lerId, validarUsuario } = require('./validacoes.js');
const { ErroHttp, tratarErro } = require('./erros.js');

class UsuarioController {
    // GET /Usuario: lista todos (com login e ultimo acesso)
    listarTodos() {
        return async function (request, response) {
            try {
                const model = new UsuarioCRUD(await conectar());
                const resultado = await model.listarTodos();
                response.json(resultado.recordset); // recordset = linhas do SELECT
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao listar os usuarios.');
            }
        };
    }

    // GET /Usuario/:id: busca pelo id
    buscarPorID() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new UsuarioCRUD(await conectar());
                const resultado = await model.buscarPorID(id);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Usuario nao encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar o usuario.');
            }
        };
    }

    // GET /Usuario/cpf/:cpf: busca pelo CPF (com ou sem pontos)
    buscarPorCPF() {
        return async function (request, response) {
            try {
                const cpf = String(request.params.cpf).replace(/\D/g, '');
                if (cpf.length !== 11) throw new ErroHttp(400, 'CPF invalido.');
                const model = new UsuarioCRUD(await conectar());
                const resultado = await model.buscarPorCPF(cpf);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Usuario nao encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar o usuario pelo CPF.');
            }
        };
    }

    // POST /Usuario: cadastra (a senha e salva como hash bcrypt)
    inserir() {
        return async function (request, response) {
            try {
                const usuario = validarUsuario(request.body, true);
                const senhaHash = await bcrypt.hash(usuario.senha, 10); // 10 = custo do hash
                const model = new UsuarioCRUD(await conectar());
                const id = await model.inserir(usuario, senhaHash);
                response.status(201).json({ id, mensagem: 'Usuario cadastrado com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao cadastrar o usuario.');
            }
        };
    }

    // PUT /Usuario/:id: altera (o login nao muda; senha em branco mantem a atual)
    atualizar() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const usuario = validarUsuario(request.body, false);
                const senhaHash = usuario.senha ? await bcrypt.hash(usuario.senha, 10) : null;
                const model = new UsuarioCRUD(await conectar());
                const encontrado = await model.atualizar(id, usuario, senhaHash);
                if (!encontrado) throw new ErroHttp(404, 'Usuario nao encontrado.');
                response.json({ id, mensagem: 'Usuario alterado com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao alterar o usuario.');
            }
        };
    }

    // DELETE /Usuario/:id: exclui (409 se o usuario tiver reservas ou acessos registrados)
    excluir() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new UsuarioCRUD(await conectar());
                const resultado = await model.excluir(id);
                if (!resultado.rowsAffected[0]) throw new ErroHttp(404, 'Usuario nao encontrado.');
                response.json({ mensagem: 'Usuario excluido com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao excluir o usuario.');
            }
        };
    }
}

module.exports = UsuarioController;
