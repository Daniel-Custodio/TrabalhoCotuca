import CrudPage from '../../components/CrudPage';
import { modulos } from '../../lib/modulos';
import { camposUsuario } from '../../lib/camposUsuario';

export const metadata = { title: 'Criar conta' };

// Tela aberta (sem login) para a pessoa criar a propria conta; depois de salvar, vai para o login
export default function Page() {
  return (
    <CrudPage
      modulo={modulos.usuarios}
      fields={camposUsuario}
      titulo="Criar conta"
      descricao="Preencha seus dados. Depois e so entrar com o login e a senha que voce escolheu."
      semTabela
      irPara="/login"
    />
  );
}
