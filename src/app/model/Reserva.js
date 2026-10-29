// Model de reserva: SQL da tabela Reserva (valores sempre como @parametros)
const { sql } = require('../../config/database.js');

// Tabela de cada tipo de recurso: L = Laboratorio, S = Sala (nomes fixos, nunca vem do usuario)
const TABELAS = { L: 'dbo.Laboratorio', S: 'dbo.Sala' };

// SELECT da reserva com o codigo do laboratorio/sala, quem reservou e o status
const SELECT_RESERVA = `
    SELECT r.id, r.tipo_recurso, r.recurso_id,
           COALESCE(l.codigo, s.codigo) AS recurso_codigo,
           COALESCE(l.nome, s.nome) AS recurso_nome,
           r.usuario_id, u.nome AS usuario_nome, ul.login AS usuario_login,
           r.status_id, st.codigo AS status_codigo, st.nome AS status_nome,
           CONVERT(varchar(10), r.data_inicial, 23) AS data_inicial,
           CONVERT(varchar(10), r.data_final, 23) AS data_final,
           CONVERT(varchar(5), r.hora_inicial, 108) AS hora_inicial,
           CONVERT(varchar(5), r.hora_final, 108) AS hora_final
    FROM dbo.Reserva r
    LEFT JOIN dbo.Laboratorio l ON r.tipo_recurso = 'L' AND l.id = r.recurso_id
    LEFT JOIN dbo.Sala s ON r.tipo_recurso = 'S' AND s.id = r.recurso_id
    JOIN dbo.Usuario u ON u.id = r.usuario_id
    LEFT JOIN dbo.UsuarioLogin ul ON ul.usuario_id = u.id
    JOIN dbo.Status st ON st.id = r.status_id`;

// Procura uma reserva do mesmo recurso que bate com os dias E com o horario pedidos.
// Dois horarios batem quando um comeca antes do outro terminar. Reserva com status LIVRE nao ocupa.
// UPDLOCK e HOLDLOCK travam a consulta ate o fim da transacao: duas pessoas nao reservam o mesmo horario juntas.
const SELECT_CONFLITO = `
    SELECT TOP 1 ul.login AS usuario_login,
           CONVERT(varchar(10), r.data_inicial, 23) AS data_inicial,
           CONVERT(varchar(10), r.data_final, 23) AS data_final,
           CONVERT(varchar(5), r.hora_inicial, 108) AS hora_inicial,
           CONVERT(varchar(5), r.hora_final, 108) AS hora_final
    FROM dbo.Reserva r WITH (UPDLOCK, HOLDLOCK)
    JOIN dbo.Status st ON st.id = r.status_id
    LEFT JOIN dbo.UsuarioLogin ul ON ul.usuario_id = r.usuario_id
    WHERE r.tipo_recurso = @tipo_recurso AND r.recurso_id = @recurso_id
      AND r.data_inicial <= @data_final AND r.data_final >= @data_inicial
      AND r.hora_inicial < @hora_final AND r.hora_final > @hora_inicial
      AND st.codigo <> 'LIVRE'
      AND (@ignorar_id IS NULL OR r.id <> @ignorar_id)`;

// Parametros da reserva (usados na busca de conflito, no INSERT e no UPDATE)
function dadosReserva(request, reserva) {
    return request
        .input('tipo_recurso', sql.Char(1), reserva.tipo_recurso)
        .input('recurso_id', sql.Int, reserva.recurso_id)
        .input('usuario_id', sql.Int, reserva.usuario_id)
        .input('status_id', sql.Int, reserva.status_id)
        .input('data_inicial', sql.VarChar(10), reserva.data_inicial)
        .input('data_final', sql.VarChar(10), reserva.data_final)
        .input('hora_inicial', sql.VarChar(5), reserva.hora_inicial)
        .input('hora_final', sql.VarChar(5), reserva.hora_final);
}

class ReservaCRUD {
    constructor(db) {
        this._db = db; // conexao com o banco
    }

    // Lista as reservas; cada filtro so vale se for informado (consulta por recurso, dia, hora, usuario e status)
    listar(filtros) {
        return this._db.request()
            .input('tipo_recurso', sql.Char(1), filtros.tipo_recurso)
            .input('recurso_id', sql.Int, filtros.recurso_id)
            .input('data', sql.VarChar(10), filtros.data)
            .input('hora', sql.VarChar(5), filtros.hora)
            .input('usuario_id', sql.Int, filtros.usuario_id)
            .input('status_id', sql.Int, filtros.status_id)
            .query(`${SELECT_RESERVA}
                    WHERE (@tipo_recurso IS NULL OR r.tipo_recurso = @tipo_recurso)
                      AND (@recurso_id IS NULL OR r.recurso_id = @recurso_id)
                      AND (@data IS NULL OR @data BETWEEN r.data_inicial AND r.data_final)
                      AND (@hora IS NULL OR (r.hora_inicial <= @hora AND r.hora_final > @hora))
                      AND (@usuario_id IS NULL OR r.usuario_id = @usuario_id)
                      AND (@status_id IS NULL OR r.status_id = @status_id)
                    ORDER BY r.data_inicial, r.hora_inicial`);
    }

    // Busca pelo id
    buscarPorID(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query(`${SELECT_RESERVA} WHERE r.id = @id`);
    }

    // Confere se o laboratorio ou a sala existe
    async recursoExiste(tipo, id) {
        const resultado = await this._db.request()
            .input('id', sql.Int, id)
            .query(`SELECT id FROM ${TABELAS[tipo]} WHERE id = @id`);
        return resultado.recordset.length > 0;
    }

    // Quantas reservas um laboratorio ou sala tem (para nao excluir recurso com reserva)
    async contarPorRecurso(tipo, id) {
        const resultado = await this._db.request()
            .input('tipo_recurso', sql.Char(1), tipo)
            .input('recurso_id', sql.Int, id)
            .query('SELECT COUNT(*) AS total FROM dbo.Reserva WHERE tipo_recurso = @tipo_recurso AND recurso_id = @recurso_id');
        return resultado.recordset[0].total;
    }

    // Grava a reserva se o horario estiver livre (transacao: confere e grava juntos).
    // Devolve { conflito } se o horario ja estiver ocupado, ou { id } da reserva criada.
    async inserir(reserva) {
        const transacao = new sql.Transaction(this._db);
        await transacao.begin();
        try {
            const conflito = await dadosReserva(new sql.Request(transacao), reserva)
                .input('ignorar_id', sql.Int, null)
                .query(SELECT_CONFLITO);
            if (conflito.recordset.length) {
                await transacao.rollback();
                return { conflito: conflito.recordset[0] };
            }

            const resultado = await dadosReserva(new sql.Request(transacao), reserva)
                .query(`INSERT INTO dbo.Reserva (tipo_recurso, recurso_id, usuario_id, status_id,
                                                 data_inicial, data_final, hora_inicial, hora_final)
                        OUTPUT INSERTED.id
                        VALUES (@tipo_recurso, @recurso_id, @usuario_id, @status_id,
                                @data_inicial, @data_final, @hora_inicial, @hora_final)`);
            await transacao.commit();
            return { id: resultado.recordset[0].id };
        } catch (erro) {
            await transacao.rollback().catch(() => {});
            throw erro;
        }
    }

    // Altera a reserva conferindo o horario (sem contar ela mesma). Devolve { conflito }, { naoExiste } ou { id }
    async atualizar(id, reserva) {
        const transacao = new sql.Transaction(this._db);
        await transacao.begin();
        try {
            const conflito = await dadosReserva(new sql.Request(transacao), reserva)
                .input('ignorar_id', sql.Int, id)
                .query(SELECT_CONFLITO);
            if (conflito.recordset.length) {
                await transacao.rollback();
                return { conflito: conflito.recordset[0] };
            }

            const resultado = await dadosReserva(new sql.Request(transacao), reserva)
                .input('id', sql.Int, id)
                .query(`UPDATE dbo.Reserva
                        SET tipo_recurso = @tipo_recurso, recurso_id = @recurso_id, usuario_id = @usuario_id,
                            status_id = @status_id, data_inicial = @data_inicial, data_final = @data_final,
                            hora_inicial = @hora_inicial, hora_final = @hora_final
                        WHERE id = @id`);
            if (resultado.rowsAffected[0] === 0) {
                await transacao.rollback();
                return { naoExiste: true };
            }
            await transacao.commit();
            return { id };
        } catch (erro) {
            await transacao.rollback().catch(() => {});
            throw erro;
        }
    }

    // Cancela (exclui) a reserva
    excluir(id) {
        return this._db.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM dbo.Reserva WHERE id = @id');
    }
}

module.exports = ReservaCRUD;
