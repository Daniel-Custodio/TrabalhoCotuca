// Campos do cadastro de usuario (usados na tela Usuarios e na tela Criar conta)
// label = texto do formulario, coluna = titulo da coluna na tabela
export const camposUsuario = [
  { name: 'nome', label: 'Nome completo', required: true, maxLength: 150 },
  { name: 'cpf', label: 'CPF', required: true, mask: 'cpf', maxLength: 14, hint: '000.000.000-00' },
  { name: 'data_aniversario', label: 'Data de nascimento', coluna: 'Nascimento', type: 'date', required: true },
  { name: 'celular', label: 'Celular com DDD', coluna: 'Celular', required: true, mask: 'celular', maxLength: 15, hint: '(19) 99999-9999' },
  { name: 'email', label: 'E-mail', type: 'email', required: true, maxLength: 150, hint: 'nome@email.com' },
  { name: 'login', label: 'Login (nome que voce vai usar para entrar)', coluna: 'Login', required: true, createOnly: true, maxLength: 50 },
  { name: 'senha', label: 'Senha (pelo menos 4 caracteres)', type: 'password', required: true, createOnlyRequired: true, formOnly: true },
  { name: 'data_cadastro', label: 'Cadastrado em', show: 'datahora', listOnly: true },
  { name: 'data_ultimo_acesso', label: 'Ultimo acesso', show: 'datahora', listOnly: true, vazio: 'nunca entrou' },
];
