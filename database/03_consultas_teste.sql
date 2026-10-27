-- 03 - Consultas para conferir os dados (rode depois do 01 e do 02)

USE DanielCotucaBD;
GO

-- 1. Quantos registros cada tabela tem
SELECT 'Usuario' AS tabela, COUNT(*) AS quantidade FROM Usuario
UNION ALL SELECT 'UsuarioLogin', COUNT(*) FROM UsuarioLogin
UNION ALL SELECT 'LogAcesso',    COUNT(*) FROM LogAcesso
UNION ALL SELECT 'Laboratorio',  COUNT(*) FROM Laboratorio
UNION ALL SELECT 'Sala',         COUNT(*) FROM Sala
UNION ALL SELECT 'Status',       COUNT(*) FROM Status
UNION ALL SELECT 'Reserva',      COUNT(*) FROM Reserva;

-- 2. Usuarios com o login e os dados de auditoria (a senha so existe como hash)
SELECT u.id, u.nome, u.cpf, u.email, l.login, l.data_cadastro, l.data_ultimo_acesso
FROM Usuario u
LEFT JOIN UsuarioLogin l ON l.usuario_id = u.id
ORDER BY u.nome;

-- 3. Todos os recursos que podem ser reservados: laboratorios e salas juntos
SELECT 'Laboratorio' AS tipo, codigo, nome, capacidade, localizacao FROM Laboratorio
UNION ALL
SELECT 'Sala', codigo, nome, capacidade, localizacao FROM Sala
ORDER BY tipo, codigo;

-- 4. Status da reserva
SELECT id, codigo, nome, descricao FROM Status ORDER BY id;
GO
