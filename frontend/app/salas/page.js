import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Salas de aula' };

// label = texto do formulario, coluna = titulo da coluna na tabela, hint = exemplo dentro do campo
const fields = [
  { name: 'codigo', label: 'Codigo da sala', coluna: 'Codigo', required: true, maxLength: 20, hint: 'ex.: SALA-101' },
  { name: 'nome', label: 'Nome da sala', coluna: 'Nome', required: true, maxLength: 100, hint: 'ex.: Sala 101' },
  { name: 'capacidade', label: 'Quantas pessoas cabem', coluna: 'Lugares', type: 'number', required: true, hint: 'ex.: 40' },
  { name: 'localizacao', label: 'Onde fica', coluna: 'Local', required: true, maxLength: 150, hint: 'ex.: Bloco B, 1o andar' },
];

export default function Page() {
  return <CrudPage modulo={modulos.salas} fields={fields} />;
}
