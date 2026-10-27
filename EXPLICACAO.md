# Explicação da API

A API recebe os pedidos das telas, confere os dados, executa o SQL no SQL Server e responde em JSON. Ela segue o padrão MVC: **rota → controller → model → banco**.

## Caminho de um cadastro

Exemplo: cadastrar um laboratório.

1. A tela chama `cadastrar('/Laboratorio', dados)` (`frontend/lib/api.js`), que faz um `POST http://localhost:3001/Laboratorio` com o JSON.
2. `express.js` libera o CORS e transforma o JSON em `request.body`.
3. A rota `aplicacao.post('/Laboratorio', controller.inserir())` chama o controller.
4. O controller valida os dados (`validarRecurso`) e chama `model.inserir(...)`.
5. O model executa o `INSERT` com parâmetros (`@codigo`, `@nome`...) e `OUTPUT INSERTED.*`.
6. A API responde `201` com o laboratório criado, já com o `id`.
7. Se der erro em qualquer passo, o `tratarErro` responde `{ "erro": "mensagem" }` com o código certo.

## O que cada arquivo faz

| Arquivo | O que faz |
| --- | --- |
| `index.js` | Lê o `.env`, liga o servidor na porta 3001 e testa o banco |
| `src/config/database.js` | Configura a conexão com o SQL Server; `conectar()` abre a conexão uma vez só (pool) |
| `src/config/express.js` | CORS, leitura do JSON, rota `/`, rotas dos cadastros, 404 e JSON inválido |
| `src/app/routes/*Routers.js` | Liga cada endereço (GET, POST, PUT, DELETE) a um método do controller |
| `src/app/controller/*Controller.js` | Valida os dados, chama o model e monta a resposta (código + JSON) |
| `src/app/controller/validacoes.js` | Confere obrigatório, tamanho, CPF, data, celular, e-mail e senha |
| `src/app/controller/erros.js` | Transforma qualquer erro em `{ "erro": "..." }` com o código HTTP certo |
| `src/app/model/*.js` | Uma classe `XxxCRUD` por tabela, com um método para cada comando SQL |
| `database/01, 02, 03` | Cria o banco e as tabelas, grava os dados iniciais e confere os dados |
| `frontend/lib/api.js` | Funções `listar`, `cadastrar`, `atualizar` e `excluir`, que chamam a API |

## Rotas

| Método | Endereço | O que faz |
| --- | --- | --- |
| GET | `/Usuario`, `/Laboratorio`, `/Sala`, `/Status` | Lista todos |
| GET | `/Usuario/:id` (e os outros) | Busca pelo id |
| GET | `/Usuario/cpf/:cpf` | Busca o usuário pelo CPF |
| POST | `/Usuario` (e os outros) | Cadastra |
| PUT | `/Usuario/:id` (e os outros) | Altera |
| DELETE | `/Usuario/:id` (e os outros) | Exclui |

## Códigos de resposta

| Código | Quando |
| --- | --- |
| 200 | Deu certo (listar, buscar, alterar, excluir) |
| 201 | Cadastro criado |
| 400 | Dado inválido ou JSON mal escrito |
| 404 | Id ou rota que não existe |
| 409 | Valor repetido (código, CPF, e-mail, login) ou registro em uso |
| 503 | Banco de dados fora do ar |
| 500 | Erro inesperado |

## Banco de dados

| Tabela | Guarda |
| --- | --- |
| `Usuario` | CPF, nome, data de aniversário, celular, e-mail, data de cadastro |
| `UsuarioLogin` | Login, hash da senha, data de cadastro e do último acesso |
| `LogAcesso` | Cada acesso ao sistema (tela de login, Entrega 3) |
| `Laboratorio` e `Sala` | Código, nome, capacidade e localização |
| `Status` | Livre, Ocupado, Bloqueado, Reservado |
| `Reserva` | Reservas (Entrega 2) |

## Segurança

- **SQL Injection:** os valores vão como parâmetros (`@codigo`), nunca colados no texto do SQL.
- **Senha:** salva como hash bcrypt, que não volta ao texto original; nenhum `SELECT` devolve a senha.
- **Transação:** o usuário e o login são gravados juntos; se um falhar, o `rollback` desfaz o outro.
- **Validação na API:** mesmo com a tela validando, a API confere tudo, porque pode ser chamada direto (Postman, Thunder Client).

## Perguntas que podem cair na entrevista

**O que é MVC?** Model (SQL), View (as telas) e Controller (a ligação). Cada parte tem uma função só.

**Para que serve a rota?** Ela diz qual método do controller atende cada endereço e método HTTP.

**Por que o controller devolve uma função?** O Express precisa de uma função `(request, response)` para chamar quando a rota é acessada.

**O que é `async` / `await`?** O banco demora para responder; o `await` espera o resultado sem travar a API.

**O que é o pool de conexões?** A conexão é aberta uma vez e reaproveitada, em vez de abrir uma nova a cada pedido.

**O que faz o `OUTPUT INSERTED.*`?** Faz o `INSERT` ou o `UPDATE` devolver a linha gravada, sem outro `SELECT`.

**O que é CORS?** A tela (porta 3000) e a API (porta 3001) são origens diferentes; sem os cabeçalhos de CORS, o navegador bloqueia.

**O que é o `.env`?** Arquivo com a porta e os dados do banco, fora do código e fora do GitHub.

**Por que o login fica em outra tabela?** O enunciado pede os dados pessoais separados do login, da senha e da auditoria.

**O que acontece se excluir um status usado numa reserva?** O banco barra pela chave estrangeira (erro 547) e a API responde 409.

**Como testar a API sem a tela?** Pelo Thunder Client ou Postman, nos endereços da tabela de rotas, com o JSON no corpo.

## JSON de exemplo

POST `/Usuario`:

```json
{
  "nome": "Julia Barbosa",
  "cpf": "529.982.247-25",
  "data_aniversario": "2001-12-01",
  "celular": "(19) 99847-9914",
  "email": "barbosa@gmail.com",
  "login": "juliab",
  "senha": "1234"
}
```

POST `/Laboratorio` (igual para `/Sala`):

```json
{
  "codigo": "LAB-03",
  "nome": "Laboratório de Redes",
  "capacidade": 30,
  "localizacao": "Bloco B, 2º andar"
}
```

POST `/Status`:

```json
{
  "codigo": "MANUTENCAO",
  "nome": "Em manutenção",
  "descricao": "Recurso parado para conserto"
}
```
