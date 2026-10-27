import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Salas de aula' };

const fields = [
  { name: 'codigo', label: 'Código', required: true, maxLength: 20, hint: 'SALA-12' },
  { name: 'nome', label: 'Nome', required: true, maxLength: 100 },
  { name: 'capacidade', label: 'Capacidade', type: 'number', required: true },
  { name: 'localizacao', label: 'Localização', required: true, maxLength: 150, hint: 'Bloco, andar...' },
];

export default function Page() {
  return <CrudPage modulo={modulos.salas} fields={fields} />;
}
