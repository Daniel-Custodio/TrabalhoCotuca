// Cadastros do sistema: href = endereco da tela, endpoint = rota da API
export const modulos = {
  usuarios: { href: '/usuarios', endpoint: '/Usuario', titulo: 'Usuarios', singular: 'usuario' },
  laboratorios: { href: '/laboratorios', endpoint: '/Laboratorio', titulo: 'Laboratorios', singular: 'laboratorio' },
  salas: { href: '/salas', endpoint: '/Sala', titulo: 'Salas', singular: 'sala' },
  status: { href: '/status', endpoint: '/Status', titulo: 'Status', singular: 'status' },
};

export const listaModulos = Object.values(modulos);
