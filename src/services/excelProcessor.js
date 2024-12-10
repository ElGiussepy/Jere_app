const XLSX = require('xlsx'); // Para procesar el archivo Excel
const db = require('../db/connection'); // Conexión a la base de datos

// Función para procesar el archivo Excel
function processExcel(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);  // Leer el archivo Excel
        const sheetName = workbook.SheetNames[0];  // Obtener el nombre de la primera hoja
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);  // Convertir los datos de la hoja a formato JSON
        return sheetData;
    } catch (error) {
        console.error('Error al procesar el archivo Excel:', error);
        throw new Error('Error al procesar el archivo Excel');
    }
}

// Función para guardar los datos procesados en la base de datos
function saveToDatabase(data) {
    const query = `INSERT INTO tu_tabla (columna1, columna2, columna3) VALUES (?, ?, ?)`;  // Asegúrate de que los nombres de las columnas coincidan con los de tu base de datos

    data.forEach(row => {
        const values = [row.columna1, row.columna2, row.columna3];  // Extrae los datos del Excel para cada fila
        db.run(query, values, (err) => {
            if (err) {
                console.error('Error al insertar los datos en la base de datos:', err.message);
            }
        });
    });
}

module.exports = { processExcel, saveToDatabase };
