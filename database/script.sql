-- Sistema de Reserva de Laboratorios e Salas de Aula
-- SQL Server (execute o script inteiro de uma vez, conectado como Autenticacao do Windows)

-- 1) Banco de dados
IF DB_ID('DanielCotucaBD') IS NULL CREATE DATABASE DanielCotucaBD;
GO

-- 2) Login do SQL Server (usuario DanielCotuca / senha DanielCotuca)
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'DanielCotuca')
    CREATE LOGIN DanielCotuca WITH PASSWORD = 'DanielCotuca', CHECK_POLICY = OFF;
GO

USE DanielCotucaBD;
GO

-- 3) Usuario dono do banco
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'DanielCotuca')
    CREATE USER DanielCotuca FOR LOGIN DanielCotuca;
ALTER ROLE db_owner ADD MEMBER DanielCotuca;
GO

-- 4) Tabelas
CREATE TABLE Usuario (
    id               INT IDENTITY(1,1) PRIMARY KEY,
    cpf              CHAR(11)      NOT NULL UNIQUE,
    nome             VARCHAR(150)  NOT NULL,
    data_aniversario DATE          NOT NULL,
    celular          VARCHAR(20)   NOT NULL,
    email            VARCHAR(150)  NOT NULL UNIQUE,
    data_cadastro    DATETIME      NOT NULL DEFAULT GETDATE()
);

-- Login/senha e dados de auditoria
CREATE TABLE UsuarioLogin (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id          INT           NOT NULL UNIQUE,
    login               VARCHAR(50)   NOT NULL UNIQUE,
    senha_hash          VARCHAR(100)  NOT NULL,
    data_cadastro       DATETIME      NOT NULL DEFAULT GETDATE(),
    data_ultimo_acesso  DATETIME      NULL,
    CONSTRAINT FK_UsuarioLogin_Usuario FOREIGN KEY (usuario_id)
        REFERENCES Usuario(id) ON DELETE CASCADE
);

-- Todo acesso ao sistema (usado na entrega da tela de login)
CREATE TABLE LogAcesso (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id   INT      NOT NULL,
    data_acesso  DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_LogAcesso_Usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);

CREATE TABLE Laboratorio (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    codigo      VARCHAR(20)  NOT NULL UNIQUE,
    nome        VARCHAR(100) NOT NULL,
    capacidade  INT          NOT NULL CHECK (capacidade > 0),
    localizacao VARCHAR(150) NOT NULL
);

CREATE TABLE Sala (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    codigo      VARCHAR(20)  NOT NULL UNIQUE,
    nome        VARCHAR(100) NOT NULL,
    capacidade  INT          NOT NULL CHECK (capacidade > 0),
    localizacao VARCHAR(150) NOT NULL
);

CREATE TABLE Status (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    codigo    VARCHAR(20)  NOT NULL UNIQUE,
    nome      VARCHAR(50)  NOT NULL,
    descricao VARCHAR(250) NULL
);

-- Estrutura da reserva (sera usada na entrega 2)
CREATE TABLE Reserva (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id    INT         NOT NULL,
    tipo_recurso  CHAR(1)     NOT NULL CHECK (tipo_recurso IN ('L','S')), -- L=Laboratorio, S=Sala
    recurso_id    INT         NOT NULL,
    status_id     INT         NOT NULL,
    data_inicial  DATE        NOT NULL,
    data_final    DATE        NOT NULL,
    hora_inicial  TIME        NOT NULL,
    hora_final    TIME        NOT NULL,
    data_cadastro DATETIME    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Reserva_Usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id),
    CONSTRAINT FK_Reserva_Status  FOREIGN KEY (status_id)  REFERENCES Status(id)
);
GO

INSERT INTO Status (codigo, nome, descricao) VALUES
('LIVRE',     'Livre',     'Recurso ainda nao esta reservado'),
('OCUPADO',   'Ocupado',   'Recurso esta sendo utilizado na data e hora reservada'),
('BLOQUEADO', 'Bloqueado', 'Recurso em manutencao, nao pode ser reservado'),
('RESERVADO', 'Reservado', 'Recurso reservado, porem ainda nao ocupado');
GO
