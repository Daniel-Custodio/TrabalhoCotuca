// Validacao dos dados antes de chegar no banco (dado errado = erro 400)
const { ErroHttp } = require('./erros');

// Le o :id da URL (precisa ser inteiro positivo, senao 404)
function lerId(request) {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) throw new ErroHttp(404, 'Registro nao encontrado.');
    return id;
}

// Texto: tira espacos, confere se e obrigatorio e o tamanho maximo da coluna
function texto(valor, rotulo, maximo, obrigatorio = true) {
    const limpo = valor === undefined || valor === null ? '' : String(valor).trim();
    if (!limpo) {
        if (obrigatorio) throw new ErroHttp(400, `O campo "${rotulo}" e obrigatorio.`);
        return null;
    }
    if (limpo.length > maximo) throw new ErroHttp(400, `O campo "${rotulo}" aceita no maximo ${maximo} caracteres.`);
    return limpo;
}

// Inteiro maior que zero que cabe numa coluna INT (ex.: capacidade)
function inteiroPositivo(valor, rotulo) {
    const limpo = valor === undefined || valor === null ? '' : String(valor).trim();
    if (!limpo) throw new ErroHttp(400, `O campo "${rotulo}" e obrigatorio.`);
    if (!/^\d+$/.test(limpo) || Number(limpo) <= 0 || Number(limpo) > 2147483647) {
        throw new ErroHttp(400, `O campo "${rotulo}" deve ser um numero inteiro maior que zero.`);
    }
    return Number(limpo);
}

// CPF: 11 digitos, nao todos iguais, e os 2 digitos verificadores certos
function cpfValido(cpf) {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    for (const t of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
        if (((soma * 10) % 11) % 10 !== Number(cpf[t])) return false;
    }
    return true;
}

// Data AAAA-MM-DD que existe no calendario e nao esta no futuro
function dataValida(data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
    const d = new Date(data + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data && d <= new Date();
}

// Usuario: login e senha obrigatorios so no cadastro; na edicao, senha em branco mantem a atual
function validarUsuario(body, criando) {
    const nome = texto(body.nome, 'Nome completo', 150);

    const cpf = String(body.cpf ?? '').replace(/\D/g, ''); // so os digitos
    if (!cpfValido(cpf)) throw new ErroHttp(400, 'CPF invalido.');

    const data_aniversario = String(body.data_aniversario ?? '').trim();
    if (!dataValida(data_aniversario)) throw new ErroHttp(400, 'Data de aniversario invalida.');

    const celular = texto(body.celular, 'Celular', 20);
    const digitos = celular.replace(/\D/g, '').length; // DDD + 8 ou 9 digitos
    if (digitos < 10 || digitos > 11) throw new ErroHttp(400, 'Celular invalido. Informe o DDD e o numero.');

    const email = texto(body.email, 'E-mail', 150).toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ErroHttp(400, 'E-mail invalido.');

    const login = criando ? texto(body.login, 'Login', 50) : null;

    const senha = String(body.senha ?? '');
    if ((criando || senha) && senha.length < 4) throw new ErroHttp(400, 'A senha deve ter pelo menos 4 caracteres.');

    return { nome, cpf, data_aniversario, celular, email, login, senha };
}

// Laboratorio e Sala tem os mesmos campos
function validarRecurso(body) {
    return {
        codigo: texto(body.codigo, 'Codigo', 20),
        nome: texto(body.nome, 'Nome', 100),
        capacidade: inteiroPositivo(body.capacidade, 'Capacidade'),
        localizacao: texto(body.localizacao, 'Localizacao', 150),
    };
}

// Status: a descricao e opcional
function validarStatus(body) {
    return {
        codigo: texto(body.codigo, 'Codigo', 20),
        nome: texto(body.nome, 'Nome', 50),
        descricao: texto(body.descricao, 'Descricao', 250, false),
    };
}

module.exports = { lerId, validarUsuario, validarRecurso, validarStatus };
