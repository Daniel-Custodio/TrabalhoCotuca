// Rotas de status: cada endereco chama um metodo do controller
const StatusController = require('../controller/statusController');

const controller = new StatusController();

module.exports = (aplicacao) => {
    aplicacao.get('/Status', controller.listarTodos());     // lista todos
    aplicacao.get('/Status/:id', controller.buscarPorID()); // busca pelo id
    aplicacao.post('/Status', controller.inserir());        // cadastra
    aplicacao.put('/Status/:id', controller.atualizar());   // altera
    aplicacao.delete('/Status/:id', controller.excluir());  // exclui
};
