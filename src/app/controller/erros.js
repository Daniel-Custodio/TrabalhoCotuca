// Respostas de erro da API, sempre no formato { "erro": "mensagem" }

// Erro com código HTTP (400 = dado inválido, 404 = não encontrado)
class ErroHttp extends Error {
    constructor(status, mensagem) {
        super(mensagem);
        this.status = status;
    }
}

// Junta os números de erro que o SQL Server mandou
function numerosSql(erro) {
    const numeros = [erro.number];
    for (const anterior of erro.precedingErrors || []) numeros.push(anterior.number);
    return numeros;
}

// Escolhe o código HTTP e a mensagem de cada erro
function tratarErro(response, erro, mensagemPadrao) {
    // Erro da validação ou do controller
    if (erro instanceof ErroHttp) {
        return response.status(erro.status).json({ erro: erro.message });
    }

    // Banco fora do ar: 503
    if (erro.name === 'ConnectionError') {
        console.log(erro.message);
        return response.status(503).json({ erro: 'Não foi possível conectar ao banco de dados.' });
    }

    const numeros = numerosSql(erro);

    // Valor repetido numa coluna UNIQUE (erros 2627 e 2601): 409
    if (numeros.includes(2627) || numeros.includes(2601)) {
        return response.status(409).json({ erro: 'Já existe um registro com este valor único (código, CPF, e-mail ou login).' });
    }

    // Chave estrangeira (erro 547): 409 ao excluir algo em uso, 400 nos outros casos
    if (numeros.includes(547)) {
        if (response.req.method === 'DELETE') {
            return response.status(409).json({ erro: 'Registro em uso por outro cadastro, não pode ser excluído.' });
        }
        return response.status(400).json({ erro: 'O banco recusou os dados por uma regra de integridade.' });
    }

    // Texto maior que a coluna (erros 2628 e 8152): 400
    if (numeros.includes(2628) || numeros.includes(8152)) {
        return response.status(400).json({ erro: 'Algum campo ultrapassou o tamanho máximo permitido.' });
    }

    // Outro erro: mostra no terminal e responde 500
    console.log(erro);
    response.status(500).json({ erro: mensagemPadrao });
}

module.exports = { ErroHttp, tratarErro };
