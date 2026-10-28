// Model de sala: um metodo para cada comando SQL (valores sempre como @parametros)
const { sql } = require('../../config/database.js');

class SalaCRUD {
    constructor(db) {
        this._db = db; // conexao com o banco
    }

    // Lista todas
    listarTodos() {
        return this._db.request()
            .query('SELECT * FROM dbo.Sala ORDER BY id');
    }

    // Busca pelo id
    buscarPorID(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM dbo.Sala WHERE id = @id');
    }

    // Cadastra e devolve a linha criada (OUTPUT INSERTED.*)
    inserir(sala) {
        return this._db.request()
            .input('codigo', sql.VarChar(20), sala.codigo)
            .input('nome', sql.VarChar(100), sala.nome)
            .input('capacidade', sql.Int, sala.capacidade)
            .input('localizacao', sql.VarChar(150), sala.localizacao)
            .query(`INSERT INTO dbo.Sala (codigo, nome, capacidade, localizacao)
                    OUTPUT INSERTED.*
                    VALUES (@codigo, @nome, @capacidade, @localizacao)`);
    }

    // Altera e devolve a linha alterada (vazio = id nao existe)
    atualizar(id, sala) {
        return this._db.request()
            .input('id', sql.Int, id)
            .input('codigo', sql.VarChar(20), sala.codigo)
            .input('nome', sql.VarChar(100), sala.nome)
            .input('capacidade', sql.Int, sala.capacidade)
            .input('localizacao', sql.VarChar(150), sala.localizacao)
            .query(`UPDATE dbo.Sala
                    SET codigo = @codigo, nome = @nome, capacidade = @capacidade, localizacao = @localizacao
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
    }

    // Exclui (rowsAffected = quantas linhas foram apagadas)
    excluir(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM dbo.Sala WHERE id = @id');
    }
}

module.exports = SalaCRUD;
