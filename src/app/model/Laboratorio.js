// Model de laboratorio: um metodo para cada comando SQL (valores sempre como @parametros)
const { sql } = require('../../config/database.js');

class LaboratorioCRUD {
    constructor(db) {
        this._db = db; // conexao com o banco
    }

    // Lista todos
    listarTodos() {
        return this._db.request()
            .query('SELECT * FROM dbo.Laboratorio ORDER BY id');
    }

    // Busca pelo id
    buscarPorID(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM dbo.Laboratorio WHERE id = @id');
    }

    // Cadastra e devolve a linha criada (OUTPUT INSERTED.*)
    inserir(laboratorio) {
        return this._db.request()
            .input('codigo', sql.VarChar(20), laboratorio.codigo)
            .input('nome', sql.VarChar(100), laboratorio.nome)
            .input('capacidade', sql.Int, laboratorio.capacidade)
            .input('localizacao', sql.VarChar(150), laboratorio.localizacao)
            .query(`INSERT INTO dbo.Laboratorio (codigo, nome, capacidade, localizacao)
                    OUTPUT INSERTED.*
                    VALUES (@codigo, @nome, @capacidade, @localizacao)`);
    }

    // Altera e devolve a linha alterada (vazio = id nao existe)
    atualizar(id, laboratorio) {
        return this._db.request()
            .input('id', sql.Int, id)
            .input('codigo', sql.VarChar(20), laboratorio.codigo)
            .input('nome', sql.VarChar(100), laboratorio.nome)
            .input('capacidade', sql.Int, laboratorio.capacidade)
            .input('localizacao', sql.VarChar(150), laboratorio.localizacao)
            .query(`UPDATE dbo.Laboratorio
                    SET codigo = @codigo, nome = @nome, capacidade = @capacidade, localizacao = @localizacao
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
    }

    // Exclui (rowsAffected = quantas linhas foram apagadas)
    excluir(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM dbo.Laboratorio WHERE id = @id');
    }
}

module.exports = LaboratorioCRUD;
