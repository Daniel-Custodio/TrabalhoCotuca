// Model de status da reserva: um método para cada comando SQL (valores sempre como @parâmetros)
const { sql } = require('../../config/database.js');

class StatusCRUD {
    constructor(db) {
        this._db = db; // conexão com o banco
    }

    // Lista todos
    listarTodos() {
        return this._db.request()
            .query('SELECT * FROM dbo.Status ORDER BY id');
    }

    // Busca pelo id
    buscarPorID(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM dbo.Status WHERE id = @id');
    }

    // Cadastra e devolve a linha criada (OUTPUT INSERTED.*)
    inserir(status) {
        return this._db.request()
            .input('codigo', sql.VarChar(20), status.codigo)
            .input('nome', sql.VarChar(50), status.nome)
            .input('descricao', sql.VarChar(250), status.descricao) // pode ser null
            .query(`INSERT INTO dbo.Status (codigo, nome, descricao)
                    OUTPUT INSERTED.*
                    VALUES (@codigo, @nome, @descricao)`);
    }

    // Altera e devolve a linha alterada (vazio = id não existe)
    atualizar(id, status) {
        return this._db.request()
            .input('id', sql.Int, id)
            .input('codigo', sql.VarChar(20), status.codigo)
            .input('nome', sql.VarChar(50), status.nome)
            .input('descricao', sql.VarChar(250), status.descricao)
            .query(`UPDATE dbo.Status
                    SET codigo = @codigo, nome = @nome, descricao = @descricao
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
    }

    // Exclui (o banco barra se alguma reserva usa este status)
    excluir(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM dbo.Status WHERE id = @id');
    }
}

module.exports = StatusCRUD;
