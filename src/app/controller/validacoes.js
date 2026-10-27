// Validação dos dados antes de chegar no banco (dado errado = erro 400)
const { ErroHttp } = require('./erros');

// Lê o :id da URL (precisa ser inteiro positivo, senão 404)
function lerId(request) {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new ErroHttp(404, 'Registro não encontrado.');
    return id;
}

// Texto: tira espaços, confere se é obrigatório e o tamanho máximo da coluna
function texto(valor, rotulo, maximo, obrigatorio = true) {
    const limpo = valor === undefined || valor === null ? '' : String(valor).trim();
    if (!limpo) {
        if (obrigatorio) throw new ErroHttp(400, `O campo "${rotulo}" é obrigatório.`);
        return null;
    }
    if (limpo.length > maximo) throw new ErroHttp(400, `O campo "${rotulo}" aceita no máximo ${maximo} caracteres.`);
    return limpo;
}

// Inteiro maior que zero que cabe numa coluna INT (ex.: capacidade)
function inteiroPositivo(valor, rotulo) {
    const limpo = valor === undefined || valor === null ? '' : String(valor).trim();
    if (!limpo) throw new ErroHttp(400, `O campo "${rotulo}" é obrigatório.`);
    if (!/^\d+$/.test(limpo) || Number(limpo) <= 0 || Number(limpo) > 2147483647) {
        throw new ErroHttp(400, `O campo "${rotulo}" deve ser um número inteiro maior que zero.`);
    }
    return Number(limpo);
}

// CPF: 11 dígitos, não todos iguais, e os 2 dígitos verificadores certos
function cpfValido(cpf) {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    for (const t of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
        if (((soma * 10) % 11) % 10 !== Number(cpf[t])) return false;
    }
    return true;
}

// Data AAAA-MM-DD que existe no calendário e não está no futuro
function dataValida(data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
    const d = new Date(data + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data && d <= new Date();
}

// Usuário: login e senha obrigatórios só no cadastro; na edição, senha em branco mantém a atual
function validarUsuario(body, criando) {
    const nome = texto(body.nome, 'Nome completo', 150);

    const cpf = String(body.cpf ?? '').replace(/\D/g, ''); // só os dígitos
    if (!cpfValido(cpf)) throw new ErroHttp(400, 'CPF inválido.');

    const data_aniversario = String(body.data_aniversario ?? '').trim();
    if (!dataValida(data_aniversario)) throw new ErroHttp(400, 'Data de aniversário inválida.');

    const celular = texto(body.celular, 'Celular', 20);
    const digitos = celular.replace(/\D/g, '').length; // DDD + 8 ou 9 dígitos
    if (digitos < 10 || digitos > 11) throw new ErroHttp(400, 'Celular inválido. Informe o DDD e o número.');

    const email = texto(body.email, 'E-mail', 150).toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ErroHttp(400, 'E-mail inválido.');

    const login = criando ? texto(body.login, 'Login', 50) : null;

    const senha = String(body.senha ?? '');
    if ((criando || senha) && senha.length < 4) throw new ErroHttp(400, 'A senha deve ter pelo menos 4 caracteres.');

    return { nome, cpf, data_aniversario, celular, email, login, senha };
}

// Laboratório e Sala têm os mesmos campos
function validarRecurso(body) {
    return {
        codigo: texto(body.codigo, 'Código', 20),
        nome: texto(body.nome, 'Nome', 100),
        capacidade: inteiroPositivo(body.capacidade, 'Capacidade'),
        localizacao: texto(body.localizacao, 'Localização', 150),
    };
}

// Status: a descrição é opcional
function validarStatus(body) {
    return {
        codigo: texto(body.codigo, 'Código', 20),
        nome: texto(body.nome, 'Nome', 50),
        descricao: texto(body.descricao, 'Descrição', 250, false),
    };
}

module.exports = { lerId, validarUsuario, validarRecurso, validarStatus };
