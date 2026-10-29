// Monta o aplicativo Express: CORS, JSON, rotas e erros
const express = require('express');

const usuarioRouters = require('../app/routes/usuarioRouters');
const laboratorioRouters = require('../app/routes/laboratorioRouters');
const salaRouters = require('../app/routes/salaRouters');
const statusRouters = require('../app/routes/statusRouters');
const loginRouters = require('../app/routes/loginRouters');
const reservaRouters = require('../app/routes/reservaRouters');

const aplicacao = express();

// CORS: libera o front (porta 3000) para chamar a API (porta 3001)
aplicacao.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // Pre-voo do navegador (OPTIONS): so responde os cabecalhos
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
});

// Le o JSON do corpo da requisicao (vira request.body)
aplicacao.use(express.json());

// Rota inicial: confirma que a API esta no ar
aplicacao.get('/', (request, response) => {
    response.json({ mensagem: 'API funcionando!' });
});

// Rotas de cada cadastro, do login e das reservas
usuarioRouters(aplicacao);
laboratorioRouters(aplicacao);
salaRouters(aplicacao);
statusRouters(aplicacao);
loginRouters(aplicacao);
reservaRouters(aplicacao);

// Rota que nao existe: 404
aplicacao.use((request, response) => {
    response.status(404).json({ erro: 'Rota nao encontrada.' });
});

// Erro ao ler o corpo: JSON mal escrito (400) ou corpo grande demais (413)
aplicacao.use((erro, request, response, next) => {
    if (erro.type === 'entity.parse.failed') {
        return response.status(400).json({ erro: 'JSON invalido no corpo da requisicao.' });
    }
    if (erro.status >= 400 && erro.status < 500) {
        return response.status(erro.status).json({ erro: 'Requisicao invalida.' });
    }
    console.log(erro);
    response.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = aplicacao;
