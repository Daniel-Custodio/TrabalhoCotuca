// Model de usuário: SQL das tabelas Usuario e UsuarioLogin (valores sempre como @parâmetros)
const { sql } = require('../../config/database.js');

// SELECT do usuário com o login junto (a senha nunca é devolvida)
const SELECT_USUARIO = `
    SELECT u.id, u.cpf, u.nome, u.data_aniversario, u.celular, u.email, u.data_cadastro,
           l.login, l.data_ultimo_acesso
    FROM dbo.Usuario u
    LEFT JOIN dbo.UsuarioLogin l ON l.usuario_id = u.id`;

// Parâmetros dos dados pessoais (usados no INSERT e no UPDATE)
function dadosPessoais(request, usuario) {
    return request
        .input('cpf', sql.Char(11), usuario.cpf)
        .input('nome', sql.VarChar(150), usuario.nome)
        .input('data_aniversario', sql.Date, new Date(usuario.data_aniversario + 'T00:00:00Z'))
        .input('celular', sql.VarChar(20), usuario.celular)
        .input('email', sql.VarChar(150), usuario.email);
}

class UsuarioCRUD {
    constructor(db) {
        this._db = db; // conexão com o banco
    }

    // Lista todos, em ordem de nome
    listarTodos() {
        return this._db.request()
            .query(`${SELECT_USUARIO} ORDER BY u.nome`);
    }

    // Busca pelo id
    buscarPorID(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query(`${SELECT_USUARIO} WHERE u.id = @id`);
    }

    // Busca pelo CPF
    buscarPorCPF(cpf) {
        return this._db.request()
            .input('cpf', sql.Char(11), cpf)
            .query(`${SELECT_USUARIO} WHERE u.cpf = @cpf`);
    }

    // Grava usuário e login juntos numa transação (ou grava os dois, ou nenhum)
    async inserir(usuario, senhaHash) {
        const transacao = new sql.Transaction(this._db);
        await transacao.begin();
        try {
            const resultado = await dadosPessoais(new sql.Request(transacao), usuario)
                .query(`INSERT INTO dbo.Usuario (cpf, nome, data_aniversario, celular, email)
                        OUTPUT INSERTED.id
                        VALUES (@cpf, @nome, @data_aniversario, @celular, @email)`);
            const id = resultado.recordset[0].id; // id gerado pelo banco

            await new sql.Request(transacao)
                .input('usuario_id', sql.Int, id)
                .input('login', sql.VarChar(50), usuario.login)
                .input('senha_hash', sql.VarChar(100), senhaHash)
                .query(`INSERT INTO dbo.UsuarioLogin (usuario_id, login, senha_hash)
                        VALUES (@usuario_id, @login, @senha_hash)`);

            await transacao.commit(); // confirma as duas gravações
            return id;
        } catch (erro) {
            await transacao.rollback().catch(() => {}); // desfaz tudo
            throw erro;
        }
    }

    // Altera os dados e, se veio senha nova, troca o hash (false = id não existe)
    async atualizar(id, usuario, senhaHash) {
        const transacao = new sql.Transaction(this._db);
        await transacao.begin();
        try {
            const resultado = await dadosPessoais(new sql.Request(transacao), usuario)
                .input('id', sql.Int, id)
                .query(`UPDATE dbo.Usuario
                        SET cpf = @cpf, nome = @nome, data_aniversario = @data_aniversario,
                            celular = @celular, email = @email
                        WHERE id = @id`);
            if (resultado.rowsAffected[0] === 0) {
                await transacao.rollback();
                return false;
            }

            if (senhaHash) {
                await new sql.Request(transacao)
                    .input('usuario_id', sql.Int, id)
                    .input('senha_hash', sql.VarChar(100), senhaHash)
                    .query('UPDATE dbo.UsuarioLogin SET senha_hash = @senha_hash WHERE usuario_id = @usuario_id');
            }

            await transacao.commit();
            return true;
        } catch (erro) {
            await transacao.rollback().catch(() => {});
            throw erro;
        }
    }

    // Exclui o usuário (o login sai junto pelo ON DELETE CASCADE)
    excluir(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM dbo.Usuario WHERE id = @id');
    }
}

module.exports = UsuarioCRUD;
