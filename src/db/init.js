const db = require('./connection');

// Crear la tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS mi_tabla (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      columna1 TEXT,
      columna2 TEXT,
      columna3 TEXT
    );
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla:', err.message);
    } else {
      console.log('Tabla creada o ya existe.');
    }
  });
});
