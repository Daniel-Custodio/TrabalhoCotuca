require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crud = require('./routes/crud');
const usuarios = require('./routes/usuarios');
const { errorHandler } = require('./helpers');

const app = express();
app.use(cors());
app.use(express.json());

const recursoFields = [
  { name: 'codigo', label: 'Codigo', type: 'string', required: true },
  { name: 'nome', label: 'Nome', type: 'string', required: true },
  { name: 'capacidade', label: 'Capacidade', type: 'int', required: true },
  { name: 'localizacao', label: 'Localizacao', type: 'string', required: true },
];

app.use('/api/usuarios', usuarios);
app.use('/api/laboratorios', crud('Laboratorio', recursoFields));
app.use('/api/salas', crud('Sala', recursoFields));
app.use('/api/status', crud('Status', [
  { name: 'codigo', label: 'Codigo', type: 'string', required: true },
  { name: 'nome', label: 'Nome', type: 'string', required: true },
  { name: 'descricao', label: 'Descricao', type: 'string', required: false },
]));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
