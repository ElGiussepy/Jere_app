const XLSX = require('xlsx');

class ExcelParser {
    parseExcel(buffer) {
        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convertir a JSON
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (data.length < 2) {
                throw new Error('El archivo Excel está vacío o no tiene datos');
            }

            const headers = data[0];
            const rows = data.slice(1);

            return { headers, rows };
        } catch (error) {
            console.error('Error parsing Excel:', error);
            throw new Error(`Error procesando archivo Excel: ${error.message}`);
        }
    }

    validateHeaders(headers) {
        const requiredHeaders = [
            'Zone Comercial',
            'Grupo', 
            'Revendedora o Cliente',
            'Descripcion Revendedora/Cliente',
            'Direccion 1',
            'Localidad',
            'Codigo Postal',
            'Telefono'
        ];

        const missingHeaders = requiredHeaders.filter(required => 
            !headers.some(header => 
                header && header.toString().toLowerCase().includes(required.toLowerCase())
            )
        );

        return {
            isValid: missingHeaders.length === 0,
            missingHeaders
        };
    }

    mapRowToCliente(headers, row) {
        const headerMap = {};
        
        // Mapear headers a índices
        headers.forEach((header, index) => {
            if (header) {
                const headerStr = header.toString().toLowerCase();
                if (headerStr.includes('zone comercial')) headerMap.zona = index;
                else if (headerStr.includes('grupo')) headerMap.grupo = index;
                else if (headerStr.includes('revendedora o cliente')) headerMap.cliente = index;
                else if (headerStr.includes('descripcion')) headerMap.nombre = index;
                else if (headerStr.includes('direccion 1')) headerMap.direccion = index;
                else if (headerStr.includes('localidad')) headerMap.localidad = index;
                else if (headerStr.includes('codigo postal')) headerMap.cp = index;
                else if (headerStr.includes('telefono')) headerMap.telefono = index;
            }
        });

        const cliente = {
            Zona: parseInt(row[headerMap.zona]) || null,
            Grupo: parseInt(row[headerMap.grupo]) || null,
            Cliente: parseInt(row[headerMap.cliente]) || null,
            Nombre: row[headerMap.nombre] ? row[headerMap.nombre].toString().trim() : '',
            Direccion: row[headerMap.direccion] ? row[headerMap.direccion].toString().trim() : '',
            Localidad: row[headerMap.localidad] ? row[headerMap.localidad].toString().trim() : '',
            CP: parseInt(row[headerMap.cp]) || null,
            Telefono: row[headerMap.telefono] ? row[headerMap.telefono].toString().trim() : '',
            Coordenadas: null
        };

        return cliente;
    }
}

module.exports = new ExcelParser();