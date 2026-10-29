// Model de login: busca o login para conferir a senha e registra cada acesso
const { sql } = require('../../config/database.js');

class LoginCRUD {
    constructor(db) {
        this._db = db; // conexao com o banco
    }

    // Busca o login com o hash da senha (o hash so e usado para conferir, nunca e devolvido)
    buscarPorLogin(login) {
        return this._db.request()
            .input('login', sql.VarChar(50), login)
            .query(`SELECT l.usuario_id, l.login, l.senha_hash, u.nome
                    FROM dbo.UsuarioLogin l
                    JOIN dbo.Usuario u ON u.id = l.usuario_id
                    WHERE l.login = @login`);
    }

    // Grava a data do ultimo acesso e uma linha nova no LogAcesso
    registrarAcesso(usuarioId) {
        return this._db.request()
            .input('usuario_id', sql.Int, usuarioId)
            .query(`UPDATE dbo.UsuarioLogin SET data_ultimo_acesso = GETDATE() WHERE usuario_id = @usuario_id;
                    INSERT INTO dbo.LogAcesso (usuario_id) VALUES (@usuario_id);`);
    }
}

module.exports = LoginCRUD;
