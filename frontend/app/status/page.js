import CrudPage from '../../components/CrudPage';

const fields = [
  { name: 'codigo', label: 'Codigo', required: true },
  { name: 'nome', label: 'Nome', required: true },
  { name: 'descricao', label: 'Descricao' },
];

export default function Page() {
  return <CrudPage title="Cadastro de Status" endpoint="/status" fields={fields} />;
}
