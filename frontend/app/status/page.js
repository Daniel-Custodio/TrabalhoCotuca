import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';

export const metadata = { title: 'Status' };

// label = texto do formulario, coluna = titulo da coluna na tabela, hint = exemplo dentro do campo
const fields = [
  { name: 'codigo', label: 'Sigla (em maiusculas, sem espaco)', coluna: 'Sigla', required: true, maxLength: 20, hint: 'ex.: LIVRE' },
  { name: 'nome', label: 'Nome que aparece na tela', coluna: 'Nome', required: true, maxLength: 50, hint: 'ex.: Livre' },
  { name: 'descricao', label: 'O que significa (opcional)', coluna: 'Significado', maxLength: 250 },
];

export default function Page() {
  return <CrudPage modulo={modulos.status} fields={fields} />;
}
