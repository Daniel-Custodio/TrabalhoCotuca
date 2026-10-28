// Conexao com o SQL Server (os dados vem do .env)

// Escolhe o driver: Autenticacao do Windows (msnodesqlv8) ou login do SQL Server (padrao)
const autenticacaoWindows = (process.env.DB_AUTH || 'sql').toLowerCase() === 'windows';
const sql = autenticacaoWindows ? require('mssql/msnodesqlv8') : require('mssql');

const servidor = process.env.DB_SERVER || 'localhost';
const banco = process.env.DB_NAME || 'DanielCotucaBD';
const instancia = process.env.DB_INSTANCE; // ex.: SQLEXPRESS

// Configuracao da conexao
let configuracao;
if (autenticacaoWindows) {
    const driver = process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';
    const endereco = instancia ? `${servidor}\\${instancia}` : servidor;
    configuracao = {
        connectionString: `Driver={${driver}};Server=${endereco};Database=${banco};Trusted_Connection=yes;TrustServerCertificate=yes;`,
    };
} else {
    configuracao = {
        server: servidor,
        database: banco,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: { encrypt: false, trustServerCertificate: true },
    };
    if (instancia) configuracao.options.instanceName = instancia;
    else configuracao.port = parseInt(process.env.DB_PORT || '1433', 10);
}

// Cria o pool de conexoes uma vez so e reaproveita; se falhar, tenta de novo na proxima
let conexao = null;
function conectar() {
    if (!conexao) {
        conexao = sql.connect(configuracao).catch((erro) => {
            conexao = null;
            throw erro;
        });
    }
    return conexao;
}

module.exports = { sql, conectar, banco };
