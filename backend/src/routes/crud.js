const express = require('express');
const { sql, getPool } = require('../db');
const { asyncH, HttpError } = require('../helpers');

// Gera um CRUD simples para uma tabela
// fields: [{ name, label, type: 'string' | 'int', required }]
module.exports = function crud(table, fields) {
  const router = express.Router();

  function parse(body) {
    const data = {};
    for (const f of fields) {
      let v = body[f.name];
      if (typeof v === 'string') v = v.trim();
      if (v === undefined || v === null || v === '') {
        if (f.required) throw new HttpError(400, `O campo "${f.label}" e obrigatorio.`);
        data[f.name] = null;
        continue;
      }
      if (f.type === 'int') {
        v = parseInt(v, 10);
        if (Number.isNaN(v) || v <= 0) throw new HttpError(400, `O campo "${f.label}" deve ser um numero maior que zero.`);
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
    const data = parse(req.body);
    const pool = await getPool();
    const sets = fields.map((f) => `${f.name} = @${f.name}`).join(', ');
    const r = await bind(pool.request(), data)
      .input('id', sql.Int, req.params.id)
      .query(`UPDATE ${table} SET ${sets} OUTPUT INSERTED.* WHERE id = @id`);
    if (!r.recordset.length) throw new HttpError(404, 'Registro nao encontrado.');
    res.json(r.recordset[0]);
  }));

  router.delete('/:id', asyncH(async (req, res) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, req.params.id)
      .query(`DELETE FROM ${table} WHERE id = @id`);
    if (!r.rowsAffected[0]) throw new HttpError(404, 'Registro nao encontrado.');
    res.status(204).end();
  }));

  return router;
};
