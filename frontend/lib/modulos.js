// Cadastros do sistema: href = endereço da tela, endpoint = rota da API
export const modulos = {
  usuarios: { href: '/usuarios', endpoint: '/Usuario', titulo: 'Usuários', singular: 'usuário' },
  laboratorios: { href: '/laboratorios', endpoint: '/Laboratorio', titulo: 'Laboratórios', singular: 'laboratório' },
  salas: { href: '/salas', endpoint: '/Sala', titulo: 'Salas', singular: 'sala' },
  status: { href: '/status', endpoint: '/Status', titulo: 'Status', singular: 'status' },
};

export const listaModulos = Object.values(modulos);
