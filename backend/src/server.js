require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crud = require('./routes/crud');
const usuarios = require('./routes/usuarios');
const { errorHandler } = require('./helpers');

const app = express();
app.use(cors());
app.use(express.json());

// max = tamanho da coluna no banco (database/script.sql)
const recursoFields = [
  { name: 'codigo', label: 'Código', type: 'string', required: true, max: 20 },
  { name: 'nome', label: 'Nome', type: 'string', required: true, max: 100 },
  { name: 'capacidade', label: 'Capacidade', type: 'int', required: true },
  { name: 'localizacao', label: 'Localização', type: 'string', required: true, max: 150 },
];

app.use('/api/usuarios', usuarios);
app.use('/api/laboratorios', crud('Laboratorio', recursoFields));
app.use('/api/salas', crud('Sala', recursoFields));
app.use('/api/status', crud('Status', [
  { name: 'codigo', label: 'Código', type: 'string', required: true, max: 20 },
  { name: 'nome', label: 'Nome', type: 'string', required: true, max: 50 },
  { name: 'descricao', label: 'Descrição', type: 'string', required: false, max: 250 },
]));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
