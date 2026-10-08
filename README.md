# Sistema de Reserva de Laboratorios e Salas de Aula - Entrega 1

Cadastros de **Usuarios**, **Laboratorios**, **Salas** e **Status**.
Stack: Node.js (Express) + Next.js (React) + SQL Server.

## Como rodar

1. **Banco:** abra `database/script.sql` no SSMS (ou Azure Data Studio) e execute. Cria o banco `ReservaRecursos`, as tabelas e os 4 status iniciais.
2. **Backend:**
   ```
   cd backend
   npm install
   ```
   Edite o arquivo `.env` com usuario e senha do seu SQL Server (precisa de login SQL e TCP/IP habilitado na porta 1433). Depois:
   ```
   npm start
   ```
   API em http://localhost:3001 (teste: http://localhost:3001/api/health).
3. **Frontend:**
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Acesse http://localhost:3000

## Estrutura
- `database/script.sql`: tabelas Usuario, UsuarioLogin (login, senha com hash, data de cadastro e ultimo acesso), LogAcesso, Laboratorio, Sala, Status e Reserva (para as proximas entregas).
- `backend/`: API REST em `/api/usuarios`, `/api/laboratorios`, `/api/salas`, `/api/status` (GET, POST, PUT, DELETE).
- `frontend/`: telas Next.js (App Router) com listagem, cadastro, edicao e exclusao.

## Bibliografia
(Complete com as fontes que voces realmente consultaram: documentacao oficial do Node.js, Express, Next.js, mssql, SQL Server, videos, livros e ferramentas de IA utilizadas. O enunciado exige que tudo isso conste aqui.)

## Equipe
- Aluno 1: 
- Aluno 2: 
