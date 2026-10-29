# Sistema de Reserva de Laboratórios e Salas de Aula

Projeto de Prática Profissional (2º semestre).
O sistema tem os cadastros de **Usuários**, **Laboratórios**, **Salas** e **Status**, a **tela de login** e a **reserva de laboratórios e salas**, com consulta das reservas.

**Tecnologias:** Node.js (Express) no back-end, React com Next.js no front-end e SQL Server como banco de dados relacional.

## Como rodar o projeto

### 1. Banco de dados
1. Abra o SSMS (ou Azure Data Studio) e conecte no servidor.
2. Execute `database/01_criar_tabelas.sql`: cria o banco `DanielCotucaBD`, o login `DanielCotuca` e as tabelas.
3. Execute `database/02_dados_iniciais.sql`: grava os 4 status (Livre, Ocupado, Bloqueado e Reservado) e alguns laboratórios e salas de exemplo.
4. Se quiser conferir, execute `database/03_consultas_teste.sql`.

### 2. API (back-end)
Na pasta raiz do projeto, crie um arquivo chamado `.env` com o conteúdo abaixo (ajuste `DB_SERVER` e `DB_INSTANCE` para o seu servidor):

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

Depois, no terminal, na pasta raiz:

```
npm install
npm start
```

A API sobe em http://localhost:3001. O endereço http://localhost:3001/ responde `{"mensagem":"API funcionando!"}` e http://localhost:3001/Status testa a conexão com o banco.

> Se o projeto estiver dentro de uma pasta do OneDrive, prefira `npm start` a `npm run dev`: a sincronização do OneDrive mexe nos arquivos do `node_modules` e faz o `node --watch` reiniciar a API sem parar.

### 3. Front-end
Em outro terminal:

```
cd frontend
npm install
npm run dev
```

Acesse http://localhost:3000

## Estrutura do projeto (MVC)

```
index.js                  liga o servidor (é o que o npm start executa)
src/config/database.js    conexão com o SQL Server
src/config/express.js     CORS, leitura do JSON e carregamento das rotas
src/app/routes/           rotas: cada endereço chama um método do controller
src/app/controller/       controllers: validam os dados, chamam o model e respondem
src/app/model/            models: os comandos SQL de cada tabela
database/                 scripts 01 (criar), 02 (dados iniciais) e 03 (consultas)
frontend/                 telas em Next.js
```

A explicação de cada parte do código está em [EXPLICACAO.md](EXPLICACAO.md).

## Rotas da API

| Cadastro | Listar e cadastrar | Buscar, alterar e excluir |
| --- | --- | --- |
| Usuário | `GET` e `POST` `/Usuario` | `GET`, `PUT` e `DELETE` `/Usuario/:id` (e `GET /Usuario/cpf/:cpf`) |
| Laboratório | `GET` e `POST` `/Laboratorio` | `GET`, `PUT` e `DELETE` `/Laboratorio/:id` |
| Sala | `GET` e `POST` `/Sala` | `GET`, `PUT` e `DELETE` `/Sala/:id` |
| Status | `GET` e `POST` `/Status` | `GET`, `PUT` e `DELETE` `/Status/:id` |
| Reserva | `GET` (com filtros) e `POST` `/Reserva` | `GET`, `PUT` e `DELETE` `/Reserva/:id` |
| Login | `POST` `/Login` | |

## Funcionalidades

- Cadastro de usuários com CPF, nome completo, data de aniversário, celular, e-mail, login e senha. A senha é salva com hash (bcrypt).
  - O CPF é conferido pelos dígitos verificadores; a data de aniversário precisa existir e não pode estar no futuro.
  - A tabela mostra os dados de auditoria: data de cadastro e data do último acesso.
- Cadastro de laboratórios com código, nome, capacidade e localização.
- Cadastro de salas com código, nome, capacidade e localização.
- Cadastro de status das reservas.
- Login: a senha digitada é conferida com o hash guardado (bcrypt). Cada acesso fica registrado na tabela `LogAcesso` e atualiza a data do último acesso.
- Reserva de laboratório ou sala com dia (ou período), hora inicial e final, usuário e status.
  - O sistema não deixa reservar um horário que bate com outra reserva do mesmo laboratório ou sala (uma reserva com status Livre não ocupa o horário).
  - Consulta das reservas por laboratório ou sala, dia, horário, usuário e status.
- A API devolve mensagens claras para erros de validação, valores repetidos (código, CPF, e-mail, login), horário já reservado, textos maiores que a coluna do banco e registros em uso.

## Interface

- Sem login, só abrem as telas **Entrar** e **Criar conta**. Depois de entrar, o menu mostra quem está logado e o botão Sair.
- Página inicial com atalhos para o que a pessoa pode fazer.
- Tela de reservas: formulário de nova reserva e consulta com filtros; cada pessoa pode cancelar as próprias reservas.
- Em cada cadastro: um texto de ajuda, um formulário com exemplos dentro dos campos e uma tabela com busca e os botões Editar e Excluir.
- Máscaras de CPF e celular enquanto digita e mensagens de sucesso ou erro.

## Bibliografia

- Documentação oficial do Node.js: https://nodejs.org/docs
- Documentação do Express: https://expressjs.com
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do React: https://react.dev
- Documentação do pacote mssql (node-mssql): https://github.com/tediousjs/node-mssql
- Documentação do SQL Server (Microsoft Learn): https://learn.microsoft.com/sql
- Documentação do bcryptjs: https://github.com/dcodeIO/bcrypt.js
- MDN Web Docs (CSS): https://developer.mozilla.org/pt-BR/docs/Web/CSS

## Equipe

- Daniel de Padua Custodio
- Gustavo de Oliveira Abreu
