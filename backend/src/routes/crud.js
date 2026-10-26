const express = require('express');
const { sql, getPool } = require('../db');
const { asyncH, HttpError, idParam } = require('../helpers');

// Gera um CRUD simples para uma tabela
// fields: [{ name, label, type: 'string' | 'int', required, max }]
module.exports = function crud(table, fields) {
  const router = express.Router();

  function parse(body) {
    const data = {};
    for (const f of fields) {
      let v = body[f.name];
      if (typeof v === 'string') v = v.trim();
      if (v === undefined || v === null || v === '') {
        if (f.required) throw new HttpError(400, `O campo "${f.label}" é obrigatório.`);
        data[f.name] = null;
        continue;
      }
      if (f.type === 'int') {
        if (!/^\d+$/.test(String(v)) || Number(v) <= 0) {
          throw new HttpError(400, `O campo "${f.label}" deve ser um número inteiro maior que zero.`);
        }
        v = Number(v);
      } else {
        v = String(v);
        if (f.max && v.length > f.max) throw new HttpError(400, `O campo "${f.label}" aceita no máximo ${f.max} caracteres.`);
      }
      data[f.name] = v;
    }
    return data;
  }

  function bind(request, data) {
    for (const f of fields) {
      request.input(f.name, f.type === 'int' ? sql.Int : sql.VarChar, data[f.name]);
    }
    return request;
  }

  router.get('/', asyncH(async (req, res) => {
    const pool = await getPool();
    const r = await pool.request().query(`SELECT * FROM ${table} ORDER BY id`);
    res.json(r.recordset);
  }));

  router.post('/', asyncH(async (req, res) => {
    const data = parse(req.body);
    const pool = await getPool();
    const cols = fields.map((f) => f.name).join(', ');
    const vals = fields.map((f) => '@' + f.name).join(', ');
    const r = await bind(pool.request(), data)
      .query(`INSERT INTO ${table} (${cols}) OUTPUT INSERTED.* VALUES (${vals})`);
    res.status(201).json(r.recordset[0]);
  }));

  router.put('/:id', asyncH(async (req, res) => {
    const id = idParam(req);
    const data = parse(req.body);
    const pool = await getPool();
    const sets = fields.map((f) => `${f.name} = @${f.name}`).join(', ');
    const r = await bind(pool.request(), data)
      .input('id', sql.Int, id)
      .query(`UPDATE ${table} SET ${sets} OUTPUT INSERTED.* WHERE id = @id`);
    if (!r.recordset.length) throw new HttpError(404, 'Registro não encontrado.');
    res.json(r.recordset[0]);
  }));

  router.delete('/:id', asyncH(async (req, res) => {
    const id = idParam(req);
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id)
      .query(`DELETE FROM ${table} WHERE id = @id`);
    if (!r.rowsAffected[0]) throw new HttpError(404, 'Registro não encontrado.');
    res.status(204).end();
  }));

  return router;
};
