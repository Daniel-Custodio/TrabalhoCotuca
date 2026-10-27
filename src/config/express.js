// Monta o aplicativo Express: CORS, JSON, rotas e erros
const express = require('express');

const usuarioRouters = require('../app/routes/usuarioRouters');
const laboratorioRouters = require('../app/routes/laboratorioRouters');
const salaRouters = require('../app/routes/salaRouters');
const statusRouters = require('../app/routes/statusRouters');

const aplicacao = express();

// CORS: libera o front (porta 3000) para chamar a API (porta 3001)
aplicacao.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // Pré-voo do navegador (OPTIONS): só responde os cabeçalhos
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
});

// Lê o JSON do corpo da requisição (vira request.body)
aplicacao.use(express.json());

// Rota inicial: confirma que a API está no ar
aplicacao.get('/', (request, response) => {
    response.json({ mensagem: 'API funcionando!' });
});

// Rotas de cada cadastro
usuarioRouters(aplicacao);
laboratorioRouters(aplicacao);
salaRouters(aplicacao);
statusRouters(aplicacao);

// Rota que não existe: 404
aplicacao.use((request, response) => {
    response.status(404).json({ erro: 'Rota não encontrada.' });
});

// JSON mal escrito no corpo: 400
aplicacao.use((erro, request, response, next) => {
    if (erro.type === 'entity.parse.failed') {
        return response.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
    }
    console.log(erro);
    response.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = aplicacao;
