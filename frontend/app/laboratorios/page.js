import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Laboratorios' };

// label = texto do formulario, coluna = titulo da coluna na tabela, hint = exemplo dentro do campo
const fields = [
  { name: 'codigo', label: 'Codigo do laboratorio', coluna: 'Codigo', required: true, maxLength: 20, hint: 'ex.: LAB-01' },
  { name: 'nome', label: 'Nome do laboratorio', coluna: 'Nome', required: true, maxLength: 100, hint: 'ex.: Laboratorio de Redes' },
  { name: 'capacidade', label: 'Quantas pessoas cabem', coluna: 'Lugares', type: 'number', required: true, hint: 'ex.: 30' },
  { name: 'localizacao', label: 'Onde fica', coluna: 'Local', required: true, maxLength: 150, hint: 'ex.: Bloco A, 2o andar' },
];

export default function Page() {
  return <CrudPage modulo={modulos.laboratorios} fields={fields} />;
}
