const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseService {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        try {
            // Crear carpeta database si no existe
            const dbDir = path.join(__dirname, '../../database');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Conectar a la base de datos
            const dbPath = path.join(dbDir, 'TupperwareBD.sqlite');
            this.db = new Database(dbPath);
            
            console.log('📊 Conectado a la base de datos TupperwareBD');

            // Crear tabla si no existe
            this.createTables();
        } catch (error) {
            console.error('❌ Error inicializando la base de datos:', error);
            throw error;
        }
    }

    createTables() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS BD_Clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                Zona INTEGER,
                Grupo INTEGER,
                Cliente INTEGER UNIQUE,
                Nombre TEXT,
                Direccion TEXT,
                Localidad TEXT,
                CP INTEGER,
                Telefono TEXT,
                Coordenadas TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.exec(createTableSQL);
        console.log('✅ Tabla BD_Clientes verificada/creada');
    }

    // Método para obtener clientes con paginación
    getClientes(limit = 50, offset = 0, filters = {}) {
    let whereClause = '';
    const params = [];
    let paramIndex = 0;

    console.log('🎯 Aplicando filtros:', filters); // ← Para debug

    // Construir filtros dinámicos
    const filterFields = ['Zona', 'Grupo', 'Cliente', 'Nombre', 'Direccion', 'Localidad', 'CP', 'Telefono'];
    
    filterFields.forEach(field => {
        if (filters[field] && filters[field].toString().trim() !== '') {
            if (whereClause) {
                whereClause += ' AND ';
            } else {
                whereClause += ' WHERE ';
            }
            
            // Para campos numéricos (Zona, Grupo, Cliente, CP)
            if (['Zona', 'Grupo', 'Cliente', 'CP'].includes(field)) {
                whereClause += `${field} = ?`;
                params.push(parseInt(filters[field]) || 0);
            } else {
                // Para campos de texto (Nombre, Direccion, Localidad, Telefono)
                whereClause += `${field} LIKE ?`;
                params.push(`%${filters[field]}%`);
            }
            paramIndex++;
        }
    });

    // Agregar límite y offset a los parámetros
    params.push(limit, offset);

    const sql = `SELECT * FROM BD_Clientes ${whereClause} ORDER BY id LIMIT ? OFFSET ?`;
    const countSQL = `SELECT COUNT(*) as total FROM BD_Clientes ${whereClause}`;

    console.log('📝 SQL:', sql); // ← Para debug
    console.log('📊 Parámetros:', params); // ← Para debug

    try {
        const clientes = this.db.prepare(sql).all(...params);
        const totalResult = this.db.prepare(countSQL).all(...params.slice(0, -2)); // Excluir limit y offset
        const total = totalResult[0].total;

        console.log(`✅ Encontrados ${clientes.length} clientes de ${total} total`); // ← Para debug

        return {
            clientes,
            total,
            paginaActual: Math.floor(offset / limit) + 1,
            totalPaginas: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('❌ Error obteniendo clientes:', error);
        throw error;
    }
}

    // Método para buscar cliente por número de cliente
    findClienteByNumero(clienteNumero) {
        const sql = `SELECT * FROM BD_Clientes WHERE Cliente = ?`;
        return this.db.prepare(sql).get(clienteNumero);
    }

    // Método para insertar nuevo cliente
    insertCliente(clienteData) {
        const sql = `
            INSERT INTO BD_Clientes 
            (Zona, Grupo, Cliente, Nombre, Direccion, Localidad, CP, Telefono, Coordenadas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            clienteData.Zona,
            clienteData.Grupo,
            clienteData.Cliente,
            clienteData.Nombre,
            clienteData.Direccion,
            clienteData.Localidad,
            clienteData.CP,
            clienteData.Telefono,
            clienteData.Coordenadas || null
        ];

        try {
            const result = this.db.prepare(sql).run(...params);
            return { success: true, id: result.lastInsertRowid };
        } catch (error) {
            console.error('Error insertando cliente:', error);
            return { success: false, error: error.message };
        }
    }

    // Método para actualizar cliente
    updateCliente(clienteNumero, updates) {
        const fields = [];
        const params = [];

        Object.keys(updates).forEach(field => {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                params.push(updates[field]);
            }
        });

        if (fields.length === 0) return { success: true, changes: 0 };

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(clienteNumero);

        const sql = `UPDATE BD_Clientes SET ${fields.join(', ')} WHERE Cliente = ?`;

        try {
            const result = this.db.prepare(sql).run(...params);
            return { success: true, changes: result.changes };
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            return { success: false, error: error.message };
        }
    }

    // Método para obtener valores únicos para filtros (opcional)
    getUniqueValues(field) {
        const sql = `SELECT DISTINCT ${field} FROM BD_Clientes WHERE ${field} IS NOT NULL ORDER BY ${field}`;
        return this.db.prepare(sql).all().map(row => row[field]);
    }
}

module.exports = new DatabaseService();