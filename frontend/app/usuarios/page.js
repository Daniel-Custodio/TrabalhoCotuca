import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Usuarios' };

const fields = [
  { name: 'nome', label: 'Nome completo', required: true, maxLength: 150 },
  { name: 'cpf', label: 'CPF', required: true, mask: 'cpf', maxLength: 14, hint: '000.000.000-00' },
  { name: 'data_aniversario', label: 'Data de aniversario', type: 'date', required: true },
  { name: 'celular', label: 'Celular', required: true, mask: 'celular', maxLength: 15, hint: '(19) 99999-9999' },
  { name: 'email', label: 'E-mail', type: 'email', required: true, maxLength: 150 },
  { name: 'login', label: 'Login', required: true, createOnly: true, maxLength: 50 },
  { name: 'senha', label: 'Senha', type: 'password', required: true, createOnlyRequired: true, formOnly: true },
  { name: 'data_cadastro', label: 'Cadastrado em', show: 'datahora', listOnly: true },
  { name: 'data_ultimo_acesso', label: 'Ultimo acesso', show: 'datahora', listOnly: true, vazio: 'nunca' },
];

export default function Page() {
  return <CrudPage modulo={modulos.usuarios} fields={fields} />;
}
