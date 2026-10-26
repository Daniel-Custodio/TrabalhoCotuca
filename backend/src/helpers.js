// Captura erros de funcoes async nas rotas
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Le o :id da URL e garante que e um numero inteiro positivo
function idParam(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, 'Registro não encontrado.');
  return id;
}

// Converte erros do SQL Server em mensagens amigaveis
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json({ erro: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  const n = err.number;
  if (n === 2627 || n === 2601) return res.status(409).json({ erro: 'Já existe um registro com este valor único (código, CPF, e-mail ou login).' });
  if (n === 547) return res.status(409).json({ erro: 'Registro em uso por outro cadastro, não pode ser excluído.' });
  if (n === 2628 || n === 8152) return res.status(400).json({ erro: 'Algum campo ultrapassou o tamanho máximo permitido.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { asyncH, HttpError, idParam, errorHandler };
