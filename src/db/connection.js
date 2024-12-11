const sqlite3 = require('sqlite3').verbose();

// Crea o conecta a un archivo de base de datos SQLite
const db = new sqlite3.Database('./src/db/database.db', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

module.exports = db;
