// Cadastros do sistema: href = endereco da tela, endpoint = rota da API, descricao = ajuda no topo da tela
export const modulos = {
  usuarios: {
    href: '/usuarios', endpoint: '/Usuario', titulo: 'Usuarios', singular: 'usuario',
    descricao: 'Pessoas que podem entrar no sistema e fazer reservas.',
  },
  laboratorios: {
    href: '/laboratorios', endpoint: '/Laboratorio', titulo: 'Laboratorios', singular: 'laboratorio',
    descricao: 'Laboratorios que podem ser reservados. Cada um tem um codigo curto para identificar, por exemplo LAB-01.',
  },
  salas: {
    href: '/salas', endpoint: '/Sala', titulo: 'Salas', singular: 'sala',
    descricao: 'Salas de aula que podem ser reservadas. Cada uma tem um codigo curto para identificar, por exemplo SALA-101.',
  },
  status: {
    href: '/status', endpoint: '/Status', titulo: 'Status', singular: 'status',
    descricao: 'Situacoes que uma reserva pode ter: Livre, Reservado, Ocupado ou Bloqueado.',
  },
};
