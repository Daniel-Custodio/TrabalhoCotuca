import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Laboratórios' };

const fields = [
  { name: 'codigo', label: 'Código', required: true, maxLength: 20, hint: 'LAB-01', show: 'etiqueta' },
  { name: 'nome', label: 'Nome', required: true, maxLength: 100 },
  { name: 'capacidade', label: 'Capacidade', type: 'number', required: true, suffix: 'lugares' },
  { name: 'localizacao', label: 'Localização', required: true, maxLength: 150, hint: 'Bloco, andar...' },
];

export default function Page() {
  return <CrudPage modulo={modulos.laboratorios} fields={fields} />;
}
