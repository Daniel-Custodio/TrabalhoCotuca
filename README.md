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
npm install msnodesqlv8
npm start
```

A API sobe em http://localhost:3001. Para testar a conexão com o banco, acesse http://localhost:3001/api/status.

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

## Funcionalidades desta entrega

- Cadastro de usuários com CPF, nome completo, data de aniversário, celular, e-mail, login e senha. A senha é salva com hash (bcrypt).
- Cadastro de laboratórios com código, nome, capacidade e localização.
- Cadastro de salas com código, nome, capacidade e localização.
- Cadastro de status das reservas.

## Bibliografia

- Documentação oficial do Node.js: https://nodejs.org/docs
- Documentação do Express: https://expressjs.com
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do React: https://react.dev
- Documentação do pacote mssql (node-mssql): https://github.com/tediousjs/node-mssql
- Documentação do SQL Server (Microsoft Learn): https://learn.microsoft.com/sql
- Documentação do bcryptjs: https://github.com/dcodeIO/bcrypt.js
- Claude (Anthropic): ferramenta de IA utilizada como apoio ao aprendizado e à estruturação do código do projeto.

## Equipe

- Daniel de Padua Custodio
