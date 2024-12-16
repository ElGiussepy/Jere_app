const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db/sqlite');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Configuración de almacenamiento para multer
const upload = multer({ dest: 'uploads/' });

const columnasRequeridas = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../MIS_COLUMNAS.json'))
);

// Ruta para manejar la carga del archivo
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { tableName } = req.body;

    // Validación del nombre de la tabla
    if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).send('El nombre de la tabla no es válido.');
    }

    // Validación del archivo subido
    if (!req.file) {
      return res.status(400).send('No se ha subido ningún archivo.');
    }

    // Leer el archivo Excel
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir datos del Excel a JSON
    const excelData = xlsx.utils.sheet_to_json(worksheet);

    // Verificar que las columnas requeridas existan
    const columnasFaltantes = columnasRequeridas.filter(col => !Object.keys(excelData[0]).includes(col));
    if (columnasFaltantes.length > 0) {
      return res.status(400).send(`Faltan columnas requeridas: ${columnasFaltantes.join(', ')}`);
    }

    // Crear tabla en SQLite
    const columnasSQL = columnasRequeridas.map(col => `"${col}" TEXT`).join(', ');
    const createTableQuery = `CREATE TABLE "${tableName}" (${columnasSQL});`;

    await new Promise((resolve, reject) => {
      db.run(createTableQuery, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insertar datos en la tabla
    const insertQuery = `INSERT INTO "${tableName}" (${columnasRequeridas.map(col => `"${col}"`).join(', ')}) VALUES (${columnasRequeridas.map(() => '?').join(', ')})`;

    let filasInsertadas = 0;

    for (const row of excelData) {
      const valores = columnasRequeridas.map(col => row[col] || null);

      await new Promise((resolve, reject) => {
        db.run(insertQuery, valores, function (err) {
          if (err) reject(err);
          else {
            filasInsertadas++;
            resolve();
          }
        });
      });
    }

    // Eliminar archivo subido para liberar espacio
    fs.unlinkSync(filePath);

    // Responder al cliente
    res.send(`La tabla "${tableName}" se creó y se subieron ${filasInsertadas} filas correctamente.`);

  } catch (error) {
    console.error('Error al procesar el archivo:', error.message);
    res.status(500).send('Error interno del servidor.');
  }
});
module.exports = router;