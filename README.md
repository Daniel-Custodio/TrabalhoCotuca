# Sistema de Reserva de Laboratórios e Salas de Aula - Entrega 1

Projeto de Prática Profissional (2º semestre).
Esta entrega contém os cadastros de **Usuários**, **Laboratórios**, **Salas** e **Status**.

**Tecnologias:** Node.js (Express) no back-end, React com Next.js no front-end e SQL Server como banco de dados relacional.

## Como rodar o projeto

### 1. Banco de dados
1. Abra o SSMS (ou Azure Data Studio) e conecte no servidor.
2. Abra o arquivo `database/script.sql` e execute tudo de uma vez.

O script cria o banco `DanielCotucaBD`, o login `DanielCotuca`, as tabelas e os 4 status iniciais (Livre, Ocupado, Bloqueado e Reservado).

### 2. Back-end (API)
Dentro da pasta `backend`, crie um arquivo chamado `.env` com o conteúdo abaixo (ajuste `DB_SERVER` e `DB_INSTANCE` para o seu servidor):

```
PORT=3001
DB_AUTH=windows
DB_SERVER=MSI
DB_INSTANCE=SQLEXPRESS
DB_NAME=DanielCotucaBD
DB_ODBC_DRIVER=ODBC Driver 17 for SQL Server
```

Para usar login e senha do SQL Server no lugar da Autenticação do Windows, troque as linhas de autenticação por:

```
DB_AUTH=sql
DB_USER=DanielCotuca
DB_PASSWORD=DanielCotuca
```

Depois, no terminal:

```
cd backend
npm install
npm start
```

A API sobe em http://localhost:3001. Para testar a conexão com o banco, acesse http://localhost:3001/api/status.

> Se o projeto estiver dentro de uma pasta do OneDrive, prefira `npm start` a `npm run dev`: a sincronização do OneDrive mexe nos arquivos do `node_modules` e faz o `node --watch` reiniciar a API sem parar.

### 3. Front-end
Em outro terminal:

```
cd frontend
npm install
npm run dev
```

Acesse http://localhost:3000

## Estrutura do projeto

- `database/script.sql`: criação do banco, do login e das tabelas Usuario, UsuarioLogin (login, senha criptografada, data de cadastro e data do último acesso), LogAcesso, Laboratorio, Sala, Status e Reserva (as duas últimas usadas nas próximas entregas).
- `backend/`: API REST com as rotas `/api/usuarios`, `/api/laboratorios`, `/api/salas` e `/api/status` (GET, POST, PUT e DELETE).
- `frontend/`: telas em Next.js (App Router) com listagem, cadastro, edição e exclusão.
  - `components/CrudPage.js`: tela genérica de cadastro (ficha + tabela com busca) usada pelos quatro cadastros.
  - `components/Menu.js`: menu lateral.
  - `lib/modulos.js`: nome, número e descrição de cada cadastro; `lib/formato.js`: máscaras de CPF/celular e formatação de datas.

## Funcionalidades desta entrega

- Cadastro de usuários com CPF, nome completo, data de aniversário, celular, e-mail, login e senha. A senha é salva com hash (bcrypt).
  - O CPF é conferido pelos dígitos verificadores; a data de aniversário precisa existir e não pode estar no futuro.
  - A tabela mostra os dados de auditoria: data de cadastro e data do último acesso.
- Cadastro de laboratórios com código, nome, capacidade e localização.
- Cadastro de salas com código, nome, capacidade e localização.
- Cadastro de status das reservas.
- A API devolve mensagens claras para erros de validação, valores repetidos (código, CPF, e-mail, login), textos maiores que a coluna do banco e registros em uso.

## Interface

O visual foi pensado em cima do tema do projeto, a portaria da escola onde ficam as chaves das salas:

- **Menu lateral verde-lousa** com destaque em amarelo-giz e fundo de caderno quadriculado.
- **Painel inicial em formato de quadro de chaves**: cada cadastro é uma etiqueta pendurada que mostra quantos registros existem no banco, além da legenda dos status e de um aviso se a API estiver fora do ar.
- **Ficha de cadastro** com margem de caderno e furos de fichário; o mesmo formulário serve para cadastrar e editar.
- **Tabela** com busca (ignora acentos), códigos em formato de etiqueta de chave e status em formato de carimbo colorido (Livre, Ocupado, Bloqueado e Reservado).
- Máscaras de CPF e celular enquanto digita, avisos de sucesso/erro e layout adaptado para celular.

## Bibliografia

- Documentação oficial do Node.js: https://nodejs.org/docs
- Documentação do Express: https://expressjs.com
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do React: https://react.dev
- Documentação do pacote mssql (node-mssql): https://github.com/tediousjs/node-mssql
- Documentação do SQL Server (Microsoft Learn): https://learn.microsoft.com/sql
- Documentação do bcryptjs: https://github.com/dcodeIO/bcrypt.js
- MDN Web Docs (CSS Grid, Flexbox, variáveis CSS): https://developer.mozilla.org/pt-BR/docs/Web/CSS
- Fontsource (fontes Bricolage Grotesque e IBM Plex Mono, licença SIL Open Font License): https://fontsource.org
- Claude (Anthropic): ferramenta de IA utilizada como apoio ao aprendizado e à estruturação do código do projeto.

## Equipe

- Daniel de Padua Custodio
- Gustavo de Oliveira Abreu
