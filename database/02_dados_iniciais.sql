-- 02 - Dados iniciais: os 4 status e alguns laboratorios e salas de exemplo
-- Pode rodar mais de uma vez: o NOT EXISTS so grava o que ainda nao existe
-- Usuarios sao cadastrados pela tela (a API salva a senha com hash)

USE DanielCotucaBD;
GO

-- Status da reserva
INSERT INTO Status (codigo, nome, descricao)
SELECT v.codigo, v.nome, v.descricao
FROM (VALUES
    ('LIVRE',     'Livre',     'Recurso ainda nao esta reservado'),
    ('OCUPADO',   'Ocupado',   'Recurso esta sendo utilizado na data e hora reservada'),
    ('BLOQUEADO', 'Bloqueado', 'Recurso em manutencao, nao pode ser reservado'),
    ('RESERVADO', 'Reservado', 'Recurso reservado, porem ainda nao ocupado')
) AS v (codigo, nome, descricao)
WHERE NOT EXISTS (SELECT 1 FROM Status s WHERE s.codigo = v.codigo);
GO

-- Laboratorios de exemplo
INSERT INTO Laboratorio (codigo, nome, capacidade, localizacao)
SELECT v.codigo, v.nome, v.capacidade, v.localizacao
FROM (VALUES
    ('LAB-01', 'Desenvolvimento de Sistemas', 30, 'Bloco A, piso 1'),
    ('LAB-02', 'Redes de Computadores',       25, 'Bloco A, piso 2')
) AS v (codigo, nome, capacidade, localizacao)
WHERE NOT EXISTS (SELECT 1 FROM Laboratorio l WHERE l.codigo = v.codigo);
GO

-- Salas de aula de exemplo
INSERT INTO Sala (codigo, nome, capacidade, localizacao)
SELECT v.codigo, v.nome, v.capacidade, v.localizacao
FROM (VALUES
    ('SALA-101', 'Sala 101', 40, 'Bloco B, piso 1'),
    ('SALA-202', 'Sala 202', 35, 'Bloco B, piso 2')
) AS v (codigo, nome, capacidade, localizacao)
WHERE NOT EXISTS (SELECT 1 FROM Sala s WHERE s.codigo = v.codigo);
GO
