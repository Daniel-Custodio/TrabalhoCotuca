const express = require('express');
const bcrypt = require('bcryptjs');
const { sql, getPool } = require('../db');
const { asyncH, HttpError } = require('../helpers');

const router = express.Router();

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
  if (d.cpf.length !== 11) throw new HttpError(400, 'CPF deve ter 11 digitos.');
  if (!d.nome) throw new HttpError(400, 'O campo "Nome completo" e obrigatorio.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.data_aniversario)) throw new HttpError(400, 'Data de aniversario invalida.');
  if (!d.celular) throw new HttpError(400, 'O campo "Celular" e obrigatorio.');
  if (!/^\S+@\S+\.\S+$/.test(d.email)) throw new HttpError(400, 'E-mail invalido.');
  if (criando) {
    if (!d.login) throw new HttpError(400, 'O campo "Login" e obrigatorio.');
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
    await tx.rollback();
    throw e;
  }
}));

router.put('/:id', asyncH(async (req, res) => {
  const d = validar(req.body, false);
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const r = await reqUsuario(new sql.Request(tx), d)
      .input('id', sql.Int, req.params.id)
      .query(`UPDATE Usuario SET cpf=@cpf, nome=@nome, data_aniversario=@data_aniversario,
              celular=@celular, email=@email WHERE id=@id`);
    if (!r.rowsAffected[0]) throw new HttpError(404, 'Usuario nao encontrado.');
    if (d.senha) {
      const hash = await bcrypt.hash(d.senha, 10);
      await new sql.Request(tx)
        .input('id', sql.Int, req.params.id)
        .input('hash', sql.VarChar(100), hash)
        .query('UPDATE UsuarioLogin SET senha_hash=@hash WHERE usuario_id=@id');
    }
    await tx.commit();
    res.json({ id: Number(req.params.id) });
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}));

router.delete('/:id', asyncH(async (req, res) => {
  const pool = await getPool();
  const r = await pool.request().input('id', sql.Int, req.params.id)
    .query('DELETE FROM Usuario WHERE id = @id');
  if (!r.rowsAffected[0]) throw new HttpError(404, 'Usuario nao encontrado.');
  res.status(204).end();
}));

module.exports = router;
