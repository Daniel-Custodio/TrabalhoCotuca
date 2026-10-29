// Rotas de login: cada endereco chama um metodo do controller
const LoginController = require('../controller/loginController');

const controller = new LoginController();

module.exports = (aplicacao) => {
    aplicacao.post('/Login', controller.entrar()); // confere login e senha
};
