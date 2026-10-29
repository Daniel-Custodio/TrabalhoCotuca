// Controller de login: confere login e senha e registra o acesso
const bcrypt = require('bcryptjs');
const { conectar } = require('../../config/database.js');
const LoginCRUD = require('../model/Login.js');
const { validarLogin } = require('./validacoes.js');
const { ErroHttp, tratarErro } = require('./erros.js');

class LoginController {
    // POST /Login: se login e senha estiverem certos, devolve os dados do usuario
    entrar() {
        return async function (request, response) {
            try {
                const { login, senha } = validarLogin(request.body);
                const model = new LoginCRUD(await conectar());
                const resultado = await model.buscarPorLogin(login);
                const usuario = resultado.recordset[0];

                // bcrypt.compare confere a senha digitada com o hash guardado no banco
                const senhaCerta = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;
                if (!senhaCerta) throw new ErroHttp(401, 'Login ou senha incorretos.');

                await model.registrarAcesso(usuario.usuario_id); // ultimo acesso + LogAcesso
                response.json({
                    id: usuario.usuario_id,
                    nome: usuario.nome,
                    login: usuario.login,
                    mensagem: 'Login feito com sucesso.',
                });
            } catch (erro) {
                tratarErro(response, erro, 'Erro ao fazer login.');
            }
        };
    }
}

module.exports = LoginController;
