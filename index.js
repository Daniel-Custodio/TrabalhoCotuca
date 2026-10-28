// Ponto de partida da API: le o .env, liga o servidor e testa o banco
const path = require('path');

// Le o .env (porta e dados do banco)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const aplicacao = require('./src/config/express');
const { conectar, banco } = require('./src/config/database');

const porta = process.env.PORT || 3001;

// Liga o servidor na porta 3001
aplicacao.listen(porta, () => {
    console.log(`API rodando em http://localhost:${porta}`);

    // Testa a conexao com o banco
    conectar()
        .then(() => console.log(`Conexao com o banco ${banco} feita com sucesso`))
        .catch((erro) => console.log(`Erro ao conectar com o banco ${banco}: ${erro.message}`));
});
