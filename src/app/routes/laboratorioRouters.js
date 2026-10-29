// Rotas de laboratorio: cada endereco chama um metodo do controller
const LaboratorioController = require('../controller/laboratorioController');

const controller = new LaboratorioController();

module.exports = (aplicacao) => {
    aplicacao.get('/Laboratorio', controller.listarTodos());     // lista todos
    aplicacao.get('/Laboratorio/:id', controller.buscarPorID()); // busca pelo id
    aplicacao.post('/Laboratorio', controller.inserir());        // cadastra
    aplicacao.put('/Laboratorio/:id', controller.atualizar());   // altera
    aplicacao.delete('/Laboratorio/:id', controller.excluir());  // exclui
};
