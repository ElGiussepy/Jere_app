// Importar Express
const express = require('express');

// Crear una instancia de Express
const app = express();

// Definir un puerto
const PORT = 3000;

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.send('¡Hola, mundo! El servidor Express está funcionando.');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
