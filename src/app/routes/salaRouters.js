// Rotas de sala: cada endereco chama um metodo do controller
const SalaController = require('../controller/salaController');

const controller = new SalaController();

module.exports = (aplicacao) => {
    aplicacao.get('/Sala', controller.listarTodos());     // lista todas
    aplicacao.get('/Sala/:id', controller.buscarPorID()); // busca pelo id
    aplicacao.post('/Sala', controller.inserir());        // cadastra
    aplicacao.put('/Sala/:id', controller.atualizar());   // altera
    aplicacao.delete('/Sala/:id', controller.excluir());  // exclui
};
