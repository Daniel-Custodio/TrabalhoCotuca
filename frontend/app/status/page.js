import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Status' };

const fields = [
  { name: 'codigo', label: 'Código', required: true, maxLength: 20, hint: 'LIVRE' },
  { name: 'nome', label: 'Nome', required: true, maxLength: 50 },
  { name: 'descricao', label: 'Descrição', maxLength: 250 },
];

export default function Page() {
  return <CrudPage modulo={modulos.status} fields={fields} />;
}
