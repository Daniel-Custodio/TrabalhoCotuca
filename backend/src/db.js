const windowsAuth = (process.env.DB_AUTH || 'sql').toLowerCase() === 'windows';

// Autenticacao do Windows precisa do driver nativo (msnodesqlv8); SQL login usa o driver padrao
const sql = windowsAuth ? require('mssql/msnodesqlv8') : require('mssql');

const server = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_NAME || 'DanielCotucaBD';
const instance = process.env.DB_INSTANCE; // ex.: SQLEXPRESS

let config;
if (windowsAuth) {
  const driver = process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';
  const srv = instance ? `${server}\\${instance}` : server;
  config = {
    connectionString: `Driver={${driver}};Server=${srv};Database=${database};Trusted_Connection=yes;TrustServerCertificate=yes;`,
  };
} else {
  config = {
    server,
    database,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: { encrypt: false, trustServerCertificate: true },
  };
  if (instance) config.options.instanceName = instance;
  else config.port = parseInt(process.env.DB_PORT || '1433', 10);
}

let poolPromise;
function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config).catch((e) => { poolPromise = null; throw e; });
  }
  return poolPromise;
}

module.exports = { sql, getPool };