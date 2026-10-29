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

## Login

1. A tela de login manda `POST /Login` com `{ "login": "...", "senha": "..." }`.
2. O `loginController` busca o login no banco (`model/Login.js`) e confere a senha com `bcrypt.compare(senha, senha_hash)`.
3. Se estiver errado, responde **401** "Login ou senha incorretos." (a mesma mensagem para login e para senha, para não dar pista).
4. Se estiver certo, grava a data do último acesso em `UsuarioLogin`, cria uma linha em `LogAcesso` e devolve `{ id, nome, login }`.
5. O site guarda esse usuário no `sessionStorage` (`frontend/lib/sessao.js`). O componente `Protecao.js` não deixa abrir nenhuma tela sem login, a não ser **Entrar** e **Criar conta**. O botão **Sair** apaga o usuário guardado.

## Reserva

1. A tela de reservas manda `POST /Reserva` com o laboratório ou a sala, o dia (ou período), a hora inicial e final, o status e o usuário logado.
2. O `reservaController` valida com `validarReserva`:
   - a hora final precisa ser depois da inicial;
   - a data final não pode ser antes da inicial;
   - não dá para reservar um dia que já passou.
3. Ele confere se o laboratório ou a sala existe.
4. O `model/Reserva.js` faz, numa **transação**:
   - procura uma reserva do mesmo recurso cujos dias **e** horários batem;
   - se achar, desfaz e a API responde **409** "Esse horario ja esta reservado: ...";
   - se não achar, grava a reserva.

Dois horários batem quando um começa antes do outro terminar. No SQL:

```sql
r.data_inicial <= @data_final AND r.data_final >= @data_inicial
AND r.hora_inicial < @hora_final AND r.hora_final > @hora_inicial
```

Assim, uma reserva das 14:00 às 16:00 bloqueia 15:00–17:00, mas deixa 16:00–18:00 (começa quando a outra termina). Uma reserva com status **Livre** não ocupa o horário. O `WITH (UPDLOCK, HOLDLOCK)` trava a consulta até gravar, para duas pessoas não reservarem o mesmo horário ao mesmo tempo.

A consulta (`GET /Reserva`) aceita filtros na URL: `?tipo_recurso=L&recurso_id=1&data=2026-11-03&hora=15:00&usuario_id=2&status_id=4`. Cada filtro só vale se for informado.

## O que cada arquivo faz

| Arquivo | O que faz |
| --- | --- |
| `index.js` | Lê o `.env`, liga o servidor na porta 3001 e testa o banco |
| `src/config/database.js` | Configura a conexão com o SQL Server; `conectar()` cria o pool de conexões uma vez só |
| `src/config/express.js` | CORS, leitura do JSON, rota `/`, rotas dos cadastros, do login e das reservas, 404 e JSON inválido |
| `src/app/routes/*Routers.js` | Liga cada endereço (GET, POST, PUT, DELETE) a um método do controller |
| `src/app/controller/*Controller.js` | Valida os dados, chama o model e monta a resposta (código + JSON) |
| `src/app/controller/validacoes.js` | Confere obrigatório, tamanho, CPF, datas, horas, celular, e-mail, senha e reserva |
| `src/app/controller/erros.js` | Transforma qualquer erro em `{ "erro": "..." }` com o código HTTP certo |
| `src/app/model/*.js` | Uma classe `XxxCRUD` por tabela, com um método para cada comando SQL |
| `database/01, 02, 03` | Cria o banco e as tabelas, grava os dados iniciais e confere os dados |
| `frontend/lib/api.js` | Funções `listar`, `cadastrar`, `atualizar`, `excluir` e `entrar`, que chamam a API |
| `frontend/lib/sessao.js` | Guarda quem fez login enquanto o navegador está aberto |
| `frontend/components/Protecao.js` | Manda para a tela de login quem ainda não entrou |

## Rotas

| Método | Endereço | O que faz |
| --- | --- | --- |
| GET | `/Usuario`, `/Laboratorio`, `/Sala`, `/Status`, `/Reserva` | Lista todos (a de reserva aceita filtros) |
| GET | `/Usuario/:id` (e os outros) | Busca pelo id |
| GET | `/Usuario/cpf/:cpf` | Busca o usuário pelo CPF |
| POST | `/Usuario` (e os outros) | Cadastra (na reserva, confere o horário) |
| PUT | `/Usuario/:id` (e os outros) | Altera |
| DELETE | `/Usuario/:id` (e os outros) | Exclui (na reserva, cancela) |
| POST | `/Login` | Confere login e senha |

## Códigos de resposta

| Código | Quando |
| --- | --- |
| 200 | Deu certo (listar, buscar, alterar, excluir, login) |
| 201 | Cadastro ou reserva criada |
| 400 | Dado inválido ou JSON mal escrito |
| 401 | Login ou senha incorretos |
| 404 | Id ou rota que não existe |
| 409 | Valor repetido, registro em uso ou horário já reservado |
| 503 | Banco de dados fora do ar |
| 500 | Erro inesperado |

## Banco de dados

| Tabela | Guarda |
| --- | --- |
| `Usuario` | CPF, nome, data de aniversário, celular, e-mail, data de cadastro |
| `UsuarioLogin` | Login, hash da senha, data de cadastro e do último acesso |
| `LogAcesso` | Cada login feito no sistema |
| `Laboratorio` e `Sala` | Código, nome, capacidade e localização |
| `Status` | Livre, Ocupado, Bloqueado, Reservado |
| `Reserva` | Recurso (L = laboratório, S = sala, e o id), usuário, status, dias e horário |

## Segurança

- **SQL Injection:** os valores vão como parâmetros (`@codigo`), nunca colados no texto do SQL.
- **Senha:** salva como hash bcrypt, que não volta ao texto original; nenhum `SELECT` devolve a senha. No login, `bcrypt.compare` confere a senha digitada com o hash.
- **Transação:** o usuário e o login são gravados juntos; a reserva confere o horário e grava junto.
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

**Como o login confere a senha se ela está com hash?** O `bcrypt.compare` faz a mesma conta com a senha digitada e compara com o hash guardado.

**Como o sistema sabe que o horário está ocupado?** Procura outra reserva do mesmo laboratório ou sala cujos dias e horários se cruzam: uma começa antes da outra terminar.

**O que acontece se excluir um status usado numa reserva?** O banco barra pela chave estrangeira (erro 547) e a API responde 409. Laboratório ou sala com reserva também não pode ser excluído.

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

POST `/Login`:

```json
{ "login": "juliab", "senha": "1234" }
```

POST `/Reserva` (`tipo_recurso`: `L` = laboratório, `S` = sala):

```json
{
  "tipo_recurso": "L",
  "recurso_id": 1,
  "usuario_id": 1,
  "status_id": 4,
  "data_inicial": "2026-11-03",
  "data_final": "2026-11-03",
  "hora_inicial": "14:00",
  "hora_final": "16:00"
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
