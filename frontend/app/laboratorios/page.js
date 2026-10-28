import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Laboratorios' };

const fields = [
  { name: 'codigo', label: 'Codigo', required: true, maxLength: 20, hint: 'LAB-01' },
  { name: 'nome', label: 'Nome', required: true, maxLength: 100 },
  { name: 'capacidade', label: 'Capacidade', type: 'number', required: true },
  { name: 'localizacao', label: 'Localizacao', required: true, maxLength: 150, hint: 'Bloco, andar...' },
];

export default function Page() {
  return <CrudPage modulo={modulos.laboratorios} fields={fields} />;
}
