const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Nao foi possivel conectar a API. Verifique se o backend esta rodando.');
  }
  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.erro || 'Erro ao processar a requisicao.');
  return json;
}
