// Guarda quem fez login enquanto o navegador estiver aberto (sessionStorage)
const CHAVE = 'usuarioLogado';

// Devolve o usuario logado ({ id, nome, login }) ou null se ninguem entrou
export function usuarioLogado() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE));
  } catch {
    return null;
  }
}

export function guardarLogin(usuario) {
  sessionStorage.setItem(CHAVE, JSON.stringify(usuario));
}

export function sair() {
  sessionStorage.removeItem(CHAVE);
}
