// Captura erros de funcoes async nas rotas
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Converte erros do SQL Server em mensagens amigaveis
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json({ erro: err.message });
  const n = err.number;
  if (n === 2627 || n === 2601) return res.status(409).json({ erro: 'Ja existe um registro com este valor unico (codigo, CPF, e-mail ou login).' });
  if (n === 547) return res.status(409).json({ erro: 'Registro em uso por outro cadastro, nao pode ser excluido.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { asyncH, HttpError, errorHandler };
