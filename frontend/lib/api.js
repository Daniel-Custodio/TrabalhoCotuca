// Todas as chamadas do front-end para a API passam por aqui
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Confere a resposta: se a API respondeu com erro, lança a mensagem que ela mandou ({ "erro": "..." })
async function tratarResposta(resposta) {
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao processar a requisição.');
  return dados;
}

// Faz a requisição HTTP; quando há dados, eles vão no corpo em JSON
async function chamar(caminho, metodo = 'GET', dados) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: dados ? { 'Content-Type': 'application/json' } : undefined,
      body: dados ? JSON.stringify(dados) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando.');
  }
  return tratarResposta(resposta);
}

// endpoint = '/Usuario', '/Laboratorio', '/Sala' ou '/Status' (veja lib/modulos.js)
export const listar = (endpoint) => chamar(endpoint);
export const cadastrar = (endpoint, dados) => chamar(endpoint, 'POST', dados);
export const atualizar = (endpoint, id, dados) => chamar(`${endpoint}/${id}`, 'PUT', dados);
export const excluir = (endpoint, id) => chamar(`${endpoint}/${id}`, 'DELETE');
