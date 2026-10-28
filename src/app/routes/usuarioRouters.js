// Rotas de usuario: cada endereco chama um metodo do controller
const UsuarioController = require('../controller/usuarioController');

const controller = new UsuarioController();

module.exports = (aplicacao) => {
    aplicacao.get('/Usuario', controller.listarTodos());          // lista todos
    aplicacao.get('/Usuario/cpf/:cpf', controller.buscarPorCPF()); // busca pelo CPF
    aplicacao.get('/Usuario/:id', controller.buscarPorID());       // busca pelo id
    aplicacao.post('/Usuario', controller.inserir());              // cadastra
    aplicacao.put('/Usuario/:id', controller.atualizar());         // altera
    aplicacao.delete('/Usuario/:id', controller.excluir());        // exclui
};
