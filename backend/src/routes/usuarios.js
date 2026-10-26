const express = require('express');
const bcrypt = require('bcryptjs');
const { sql, getPool } = require('../db');
const { asyncH, HttpError, idParam } = require('../helpers');

const router = express.Router();

// Confere os dois digitos verificadores do CPF
function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(cpf[t])) return false;
  }
  return true;
}

// Aceita apenas datas que existem no calendario e que nao estao no futuro
function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(texto + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto && d <= new Date();
}

function validar(body, criando) {
  const d = {
    cpf: String(body.cpf || '').replace(/\D/g, ''),
    nome: String(body.nome || '').trim(),
    data_aniversario: String(body.data_aniversario || '').trim(),
    celular: String(body.celular || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    login: String(body.login || '').trim(),
    senha: String(body.senha || ''),
  };
  if (!cpfValido(d.cpf)) throw new HttpError(400, 'CPF inválido.');
  if (!d.nome) throw new HttpError(400, 'O campo "Nome completo" é obrigatório.');
  if (d.nome.length > 150) throw new HttpError(400, 'O nome aceita no máximo 150 caracteres.');
  if (!dataValida(d.data_aniversario)) throw new HttpError(400, 'Data de aniversário inválida.');
  const digitosCelular = d.celular.replace(/\D/g, '').length;
  if (digitosCelular < 10 || digitosCelular > 11 || d.celular.length > 20) {
    throw new HttpError(400, 'Celular inválido. Informe o DDD e o número.');
  }
  if (!/^\S+@\S+\.\S+$/.test(d.email) || d.email.length > 150) throw new HttpError(400, 'E-mail inválido.');
  if (criando) {
    if (!d.login) throw new HttpError(400, 'O campo "Login" é obrigatório.');
    if (d.login.length > 50) throw new HttpError(400, 'O login aceita no máximo 50 caracteres.');
    if (d.senha.length < 4) throw new HttpError(400, 'A senha deve ter pelo menos 4 caracteres.');
  } else if (d.senha && d.senha.length < 4) {
    throw new HttpError(400, 'A senha deve ter pelo menos 4 caracteres.');
  }
  return d;
}

function reqUsuario(request, d) {
  return request
    .input('cpf', sql.Char(11), d.cpf)
    .input('nome', sql.VarChar(150), d.nome)
    .input('data_aniversario', sql.Date, new Date(d.data_aniversario + 'T00:00:00Z'))
    .input('celular', sql.VarChar(20), d.celular)
    .input('email', sql.VarChar(150), d.email);
}

router.get('/', asyncH(async (req, res) => {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT u.id, u.cpf, u.nome, u.data_aniversario, u.celular, u.email, u.data_cadastro,
           l.login, l.data_ultimo_acesso
    FROM Usuario u LEFT JOIN UsuarioLogin l ON l.usuario_id = u.id
    ORDER BY u.nome`);
  res.json(r.recordset);
}));

router.post('/', asyncH(async (req, res) => {
  const d = validar(req.body, true);
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const r1 = await reqUsuario(new sql.Request(tx), d).query(
      `INSERT INTO Usuario (cpf, nome, data_aniversario, celular, email)
       OUTPUT INSERTED.id VALUES (@cpf, @nome, @data_aniversario, @celular, @email)`);
    const id = r1.recordset[0].id;
    const hash = await bcrypt.hash(d.senha, 10);
    await new sql.Request(tx)
      .input('uid', sql.Int, id)
      .input('login', sql.VarChar(50), d.login)
      .input('hash', sql.VarChar(100), hash)
      .query('INSERT INTO UsuarioLogin (usuario_id, login, senha_hash) VALUES (@uid, @login, @hash)');
    await tx.commit();
    res.status(201).json({ id });
  } catch (e) {
    await tx.rollback().catch(() => {});
    throw e;
  }
}));

router.put('/:id', asyncH(async (req, res) => {
  const id = idParam(req);
  const d = validar(req.body, false);
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const r = await reqUsuario(new sql.Request(tx), d)
      .input('id', sql.Int, id)
      .query(`UPDATE Usuario SET cpf=@cpf, nome=@nome, data_aniversario=@data_aniversario,
              celular=@celular, email=@email WHERE id=@id`);
    if (!r.rowsAffected[0]) throw new HttpError(404, 'Usuário não encontrado.');
    if (d.senha) {
      const hash = await bcrypt.hash(d.senha, 10);
      await new sql.Request(tx)
        .input('id', sql.Int, id)
        .input('hash', sql.VarChar(100), hash)
        .query('UPDATE UsuarioLogin SET senha_hash=@hash WHERE usuario_id=@id');
    }
    await tx.commit();
    res.json({ id });
  } catch (e) {
    await tx.rollback().catch(() => {});
    throw e;
  }
}));

router.delete('/:id', asyncH(async (req, res) => {
  const id = idParam(req);
  const pool = await getPool();
  const r = await pool.request().input('id', sql.Int, id)
    .query('DELETE FROM Usuario WHERE id = @id');
  if (!r.rowsAffected[0]) throw new HttpError(404, 'Usuário não encontrado.');
  res.status(204).end();
}));

module.exports = router;
