import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';
import { camposUsuario } from '../../lib/camposUsuario';

export const metadata = { title: 'Usuarios' };

export default function Page() {
  return <CrudPage modulo={modulos.usuarios} fields={camposUsuario} />;
}
