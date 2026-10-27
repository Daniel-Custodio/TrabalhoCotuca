// Cadastros do sistema: usados no menu lateral, no painel e no topo de cada tela.
// href = endereço da tela no front; endpoint = rota da API (src/app/routes)
export const modulos = {
  usuarios: {
    href: '/usuarios', endpoint: '/Usuario', num: '01', titulo: 'Usuários', cor: 'giz',
    singular: 'usuário', novo: 'Novo usuário',
    texto: 'Quem pode reservar: dados pessoais, login e senha.',
  },
  laboratorios: {
    href: '/laboratorios', endpoint: '/Laboratorio', num: '02', titulo: 'Laboratórios', cor: 'lousa',
    singular: 'laboratório', novo: 'Novo laboratório',
    texto: 'Laboratórios que podem ser reservados.',
  },
  salas: {
    href: '/salas', endpoint: '/Sala', num: '03', titulo: 'Salas de aula', cor: 'tijolo',
    singular: 'sala', novo: 'Nova sala',
    texto: 'Salas de aula que podem ser reservadas.',
  },
  status: {
    href: '/status', endpoint: '/Status', num: '04', titulo: 'Status', cor: 'papel',
    singular: 'status', novo: 'Novo status',
    texto: 'Situações de uma reserva: livre, ocupado, bloqueado ou reservado.',
  },
};

export const listaModulos = Object.values(modulos);
