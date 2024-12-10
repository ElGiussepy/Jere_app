const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const db = require('../db/connection'); // Asegúrate de que la conexión esté configurada correctamente
const router = express.Router();

// Configuración de multer para cargar archivos
const upload = multer({ dest: 'uploads/' });

// Función para procesar el archivo Excel
function processExcel(filePath) {
    const workbook = XLSX.readFile(filePath);  // Leer el archivo Excel
    const sheetName = workbook.SheetNames[0];  // Obtener el nombre de la primera hoja
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);  // Convertir los datos de la hoja a formato JSON

    return sheetData;
}

// Función para guardar los datos en la base de datos
function saveToDatabase(data) {
    const query = `INSERT INTO tu_tabla (columna1, columna2, columna3) VALUES (?, ?, ?)`;  // Cambia los nombres de las columnas

    data.forEach(row => {
        const values = [row.columna1, row.columna2, row.columna3];  // Extrae los datos del Excel para cada fila
        db.run(query, values, (err) => {
            if (err) {
                console.error('Error al insertar datos:', err.message);
            }
        });
    });
}

// Ruta para cargar el archivo Excel
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ningún archivo');
    }

    try {
        const filePath = req.file.path;  // Obtener la ruta del archivo subido
        const data = processExcel(filePath);  // Procesar el archivo Excel y obtener los datos
        saveToDatabase(data);  // Guardar los datos en la base de datos

        // Enviar una respuesta exitosa
        res.send('Datos cargados exitosamente');
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).send('Error al procesar el archivo');
    }
});

module.exports = router;
