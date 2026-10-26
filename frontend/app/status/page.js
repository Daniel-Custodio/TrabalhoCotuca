import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Status' };

const fields = [
  { name: 'codigo', label: 'Código', required: true, maxLength: 20, hint: 'LIVRE', show: 'etiqueta' },
  { name: 'nome', label: 'Nome', required: true, maxLength: 50, show: 'carimbo' },
  { name: 'descricao', label: 'Descrição', maxLength: 250, wide: true },
];

export default function Page() {
  return <CrudPage modulo={modulos.status} fields={fields} />;
}
