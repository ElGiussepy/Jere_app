const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const db = require('../db/connection'); // Conexión a SQLite
const router = express.Router();

// Configuración de multer para la carga de archivos
const upload = multer({ dest: 'uploads/' });

// Función para procesar el archivo Excel
function processExcel(filePath) {
    const workbook = XLSX.readFile(filePath); // Leer el archivo Excel
    const sheetName = workbook.SheetNames[0]; // Obtener el nombre de la primera hoja
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convertir la hoja a JSON
    return sheetData;
}

// Función para guardar datos en la base de datos
function saveToDatabase(data) {
    const query = `INSERT INTO mi_tabla (columna1, columna2, columna3) VALUES (?, ?, ?)`;

    data.forEach(row => {
        const values = [row.columna1, row.columna2, row.columna3]; // Ajustar columnas según el Excel
        db.run(query, values, (err) => {
            if (err) {
                console.error('Error al insertar datos en la base:', err.message);
            }
        });
    });
}

// Ruta principal: Renderiza la página de carga
router.get('/', (req, res) => {
    res.render('upload', { title: 'Subida de Archivos Excel' });
});

// Ruta para procesar el archivo Excel subido
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ningún archivo');
    }

    try {
        const filePath = req.file.path; // Ruta del archivo subido
        const data = processExcel(filePath); // Procesar el Excel
        saveToDatabase(data); // Guardar datos en SQLite

        // Respuesta exitosa
        res.send('Datos cargados exitosamente');
    } catch (error) {
        console.error('Error al procesar el archivo:', error.message);
        res.status(500).send('Error al procesar el archivo');
    }
});

module.exports = router;
