// Controller de usuário: valida os dados, chama o model e monta a resposta
const bcrypt = require('bcryptjs');
const { conectar } = require('../../config/database.js');
const UsuarioCRUD = require('../model/Usuario.js');
const { lerId, validarUsuario } = require('./validacoes.js');
const { ErroHttp, tratarErro } = require('./erros.js');

class UsuarioController {
    // GET /Usuario: lista todos (com login e último acesso)
    listarTodos() {
        return async function (request, response) {
            try {
                const model = new UsuarioCRUD(await conectar());
                const resultado = await model.listarTodos();
                response.json(resultado.recordset); // recordset = linhas do SELECT
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao listar os usuários.');
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
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Usuário não encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar o usuário.');
            }
        };
    }

    // GET /Usuario/cpf/:cpf: busca pelo CPF (com ou sem pontos)
    buscarPorCPF() {
        return async function (request, response) {
            try {
                const cpf = String(request.params.cpf).replace(/\D/g, '');
                if (cpf.length !== 11) throw new ErroHttp(400, 'CPF inválido.');
                const model = new UsuarioCRUD(await conectar());
                const resultado = await model.buscarPorCPF(cpf);
                if (!resultado.recordset.length) throw new ErroHttp(404, 'Usuário não encontrado.');
                response.json(resultado.recordset[0]);
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao buscar o usuário pelo CPF.');
            }
        };
    }

    // POST /Usuario: cadastra (a senha é salva como hash bcrypt)
    inserir() {
        return async function (request, response) {
            try {
                const usuario = validarUsuario(request.body, true);
                const senhaHash = await bcrypt.hash(usuario.senha, 10); // 10 = custo do hash
                const model = new UsuarioCRUD(await conectar());
                const id = await model.inserir(usuario, senhaHash);
                response.status(201).json({ id, mensagem: 'Usuário cadastrado com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao cadastrar o usuário.');
            }
        };
    }

    // PUT /Usuario/:id: altera (o login não muda; senha em branco mantém a atual)
    atualizar() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const usuario = validarUsuario(request.body, false);
                const senhaHash = usuario.senha ? await bcrypt.hash(usuario.senha, 10) : null;
                const model = new UsuarioCRUD(await conectar());
                const encontrado = await model.atualizar(id, usuario, senhaHash);
                if (!encontrado) throw new ErroHttp(404, 'Usuário não encontrado.');
                response.json({ id, mensagem: 'Usuário alterado com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao alterar o usuário.');
            }
        };
    }

    // DELETE /Usuario/:id: exclui (409 se o usuário tiver reservas)
    excluir() {
        return async function (request, response) {
            try {
                const id = lerId(request);
                const model = new UsuarioCRUD(await conectar());
                const resultado = await model.excluir(id);
                if (!resultado.rowsAffected[0]) throw new ErroHttp(404, 'Usuário não encontrado.');
                response.json({ mensagem: 'Usuário excluído com sucesso.' });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao excluir o usuário.');
            }
        };
    }
}

module.exports = UsuarioController;
