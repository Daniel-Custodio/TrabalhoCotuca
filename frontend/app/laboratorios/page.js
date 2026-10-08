import CrudPage from '../../components/CrudPage';

const fields = [
  { name: 'codigo', label: 'Codigo', required: true },
  { name: 'nome', label: 'Nome', required: true },
  { name: 'capacidade', label: 'Capacidade', type: 'number', required: true },
  { name: 'localizacao', label: 'Localizacao', required: true },
];

export default function Page() {
  return <CrudPage title="Cadastro de Laboratorios" endpoint="/laboratorios" fields={fields} />;
}
