# Sistema de Reserva de Laboratórios e Salas de Aula - Entrega 1

Projeto de Prática Profissional (2º semestre).

Esta entrega contém os cadastros de **Usuários**, **Laboratórios**, **Salas** e **Status**.

**Tecnologias:** Node.js (Express) no back-end, React com Next.js no front-end e SQL Server como banco de dados relacional.

## Como rodar o projeto

### 1. Banco de dados

1. Abra o SSMS (ou Azure Data Studio) e conecte no servidor.
2. Abra o arquivo `database/script.sql` e execute tudo de uma vez.

O script cria o banco `DanielCotucaBD`, o login `DanielCotuca`, as tabelas e os 4 status iniciais: Livre, Ocupado, Bloqueado e Reservado.

### 2. Back-end (API)

Dentro da pasta `backend`, crie um arquivo chamado `.env` com o conteúdo abaixo. Ajuste `DB_SERVER` e `DB_INSTANCE` de acordo com o seu servidor:

```env
PORT=3001
DB_AUTH=windows
DB_SERVER=MSI
DB_INSTANCE=SQLEXPRESS
DB_NAME=DanielCotucaBD
DB_ODBC_DRIVER=ODBC Driver 17 for SQL Server
```

Para usar login e senha do SQL Server no lugar da Autenticação do Windows, utilize:

```env
DB_AUTH=sql
DB_USER=DanielCotuca
DB_PASSWORD=DanielCotuca
```

Depois, no terminal:

```bash
cd backend
npm install
npm start
```

A API estará disponível em `http://localhost:3001`.

Para testar a conexão com o banco, acesse:

`http://localhost:3001/api/status`

> Se o projeto estiver dentro de uma pasta do OneDrive, prefira `npm start` a `npm run dev`. A sincronização do OneDrive pode fazer o `node --watch` reiniciar a API constantemente.

### 3. Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura do projeto

- `database/script.sql`: criação do banco, do login e das tabelas `Usuario`, `UsuarioLogin`, `LogAcesso`, `Laboratorio`, `Sala`, `Status` e `Reserva`.
- `backend/`: API REST com as rotas `/api/usuarios`, `/api/laboratorios`, `/api/salas` e `/api/status`.
- `frontend/`: telas em Next.js com listagem, cadastro, edição e exclusão.
  - `components/CrudPage.js`: tela genérica de cadastro usada pelos quatro cadastros.
  - `components/Menu.js`: menu lateral.
  - `lib/modulos.js`: informações dos cadastros.
  - `lib/formato.js`: máscaras de CPF e celular e formatação de datas.

## Funcionalidades desta entrega

- Cadastro de usuários com CPF, nome completo, data de aniversário, celular, e-mail, login e senha.
- Senha armazenada com hash utilizando bcrypt.
- Validação dos dígitos verificadores do CPF.
- Validação da data de aniversário.
- Cadastro de laboratórios com código, nome, capacidade e localização.
- Cadastro de salas com código, nome, capacidade e localização.
- Cadastro de status das reservas.
- Validação de valores repetidos, como CPF, e-mail, login e códigos.
- Tratamento de erros e registros em uso.
- Exibição das datas de cadastro e último acesso dos usuários.

## Interface

O visual foi desenvolvido com base no tema da portaria da escola, onde ficam as chaves das salas:

- Menu lateral verde-lousa com destaque em amarelo-giz.
- Fundo inspirado em caderno quadriculado.
- Painel inicial em formato de quadro de chaves.
- Ficha de cadastro inspirada em uma folha de caderno.
- Tabelas com busca.
- Códigos em formato de etiqueta de chave.
- Status em formato de carimbo.
- Máscaras de CPF e celular.
- Layout adaptado para celular.

## Bibliografia

- Documentação oficial do Node.js: https://nodejs.org/docs
- Documentação do Express: https://expressjs.com
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do React: https://react.dev
- Documentação do pacote mssql: https://github.com/tediousjs/node-mssql
- Documentação do SQL Server: https://learn.microsoft.com/sql
- Documentação do bcryptjs: https://github.com/dcodeIO/bcrypt.js
- MDN Web Docs: https://developer.mozilla.org/pt-BR/docs/Web/CSS
- Fontsource: https://fontsource.org

## Equipe

- Daniel de Padua Custodio
- Gustavo de Oliveira Abreu
