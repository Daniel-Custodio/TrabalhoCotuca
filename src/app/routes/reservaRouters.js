// Rotas de reserva: cada endereco chama um metodo do controller
const ReservaController = require('../controller/reservaController');

const controller = new ReservaController();

module.exports = (aplicacao) => {
    aplicacao.get('/Reserva', controller.listarTodos());     // lista (com filtros)
    aplicacao.get('/Reserva/:id', controller.buscarPorID()); // busca pelo id
    aplicacao.post('/Reserva', controller.inserir());        // reserva
    aplicacao.put('/Reserva/:id', controller.atualizar());   // altera
    aplicacao.delete('/Reserva/:id', controller.excluir());  // cancela
};
