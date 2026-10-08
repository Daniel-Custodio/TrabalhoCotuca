import CrudPage from '../../components/CrudPage';

const fields = [
  { name: 'cpf', label: 'CPF', required: true, maxLength: 14, hint: 'Somente numeros' },
  { name: 'nome', label: 'Nome completo', required: true },
  { name: 'data_aniversario', label: 'Data de aniversario', type: 'date', required: true },
  { name: 'celular', label: 'Celular', required: true, hint: '(19) 99999-9999' },
  { name: 'email', label: 'E-mail', type: 'email', required: true },
  { name: 'login', label: 'Login', required: true, createOnly: true },
  { name: 'senha', label: 'Senha', type: 'password', required: true, createOnlyRequired: true, formOnly: true },
];

export default function Page() {
  return <CrudPage title="Cadastro de Usuarios" endpoint="/usuarios" fields={fields} />;
}
