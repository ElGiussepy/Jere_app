const express = require('express');
const databaseService = require('../services/databaseService');
const excelParser = require('../utils/excelParser');
const router = express.Router();

// Vista principal de clientes
// Vista principal de clientes
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    const filters = {
        Zona: req.query.Zona || '',
        Grupo: req.query.Grupo || '',
        Cliente: req.query.Cliente || '',
        Nombre: req.query.Nombre || '',
        Direccion: req.query.Direccion || '',
        Localidad: req.query.Localidad || '',
        CP: req.query.CP || '',
        Telefono: req.query.Telefono || ''
    };

    // Verificar si hay filtros aplicados
    const filtersApplied = Object.values(filters).some(value => value !== '');

    // Verificar si es una vista individual (solo un cliente)
    const singleClient = req.query.single === 'true' && filters.Cliente;
    
    let result;
    let clienteIndividual = null;

    if (singleClient) {
        // Si es vista individual, obtener solo ese cliente
        clienteIndividual = databaseService.findClienteByNumero(parseInt(filters.Cliente));
        result = {
            clientes: clienteIndividual ? [clienteIndividual] : [],
            total: clienteIndividual ? 1 : 0,
            paginaActual: 1,
            totalPaginas: 1
        };
    } else {
        // Vista normal con paginación
        result = databaseService.getClientes(limit, offset, filters);
    }

    res.render('clients', {
        title: 'Gestión de Clientes - Tupperware',
        cssFile: 'clients.css',
        clientes: result.clientes,
        pagination: {
            current: result.paginaActual,
            total: result.totalPaginas,
            hasPrev: page > 1,
            hasNext: page < result.totalPaginas,
            prevPage: page - 1,
            nextPage: page + 1
        },
        filters: filters,
        filtersApplied: filtersApplied,
        singleClient: clienteIndividual,
        totalClientes: result.total
    });
});

// Nueva ruta para obtener datos de un cliente individual
router.get('/cliente/:clienteId', (req, res) => {
    const clienteId = parseInt(req.params.clienteId);
    const cliente = databaseService.findClienteByNumero(clienteId);
    
    if (cliente) {
        res.json({ success: true, cliente: cliente });
    } else {
        res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }
});

// Ruta para actualizar un cliente individual
router.post('/actualizar-cliente', (req, res) => {
    const { clienteId, updates } = req.body;

    try {
        const result = databaseService.updateCliente(parseInt(clienteId), updates);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Cliente actualizado correctamente',
                changes: result.changes
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});
// Procesar actualización de base de datos
router.post('/actualizar-base', (req, res) => {
    if (!req.files || !req.files.archivoExcel) {
        return res.status(400).json({ 
            success: false, 
            error: 'No se subió ningún archivo' 
        });
    }

    const archivoExcel = req.files.archivoExcel;

    try {
        // Parsear Excel
        const { headers, rows } = excelParser.parseExcel(archivoExcel.data);

        // Validar headers
        const validation = excelParser.validateHeaders(headers);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Headers faltantes en el archivo Excel',
                missingHeaders: validation.missingHeaders
            });
        }

        // Si todo está bien, proceder con la actualización
        res.json({
            success: true,
            message: 'Archivo Excel validado correctamente. ¿Desea continuar con la actualización?',
            totalRows: rows.length,
            headers: headers
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Confirmar y ejecutar la actualización
router.post('/confirmar-actualizacion', (req, res) => {
    if (!req.files || !req.files.archivoExcel) {
        return res.status(400).json({ 
            success: false, 
            error: 'No se subió ningún archivo' 
        });
    }

    const archivoExcel = req.files.archivoExcel;

    try {
        const { headers, rows } = excelParser.parseExcel(archivoExcel.data);
        
        let clientesAgregados = 0;
        let clientesConDireccionCambiada = 0;

        // Procesar cada fila
        rows.forEach((row, index) => {
            if (row.length > 0) { // Fila no vacía
                const clienteData = excelParser.mapRowToCliente(headers, row);
                
                if (clienteData.Cliente) {
                    const clienteExistente = databaseService.findClienteByNumero(clienteData.Cliente);
                    
                    if (!clienteExistente) {
                        // Nuevo cliente
                        const result = databaseService.insertCliente(clienteData);
                        if (result.success) {
                            clientesAgregados++;
                        }
                    } else {
                        // Cliente existente - actualizar si hay cambios
                        const updates = {};
                        let direccionCambio = false;

                        if (clienteExistente.Zona !== clienteData.Zona) updates.Zona = clienteData.Zona;
                        if (clienteExistente.Grupo !== clienteData.Grupo) updates.Grupo = clienteData.Grupo;
                        if (clienteExistente.Nombre !== clienteData.Nombre) updates.Nombre = clienteData.Nombre;
                        
                        if (clienteExistente.Direccion !== clienteData.Direccion) {
                            updates.Direccion = clienteData.Direccion;
                            updates.Coordenadas = null; // Vaciar coordenadas si cambió la dirección
                            direccionCambio = true;
                        }
                        
                        if (clienteExistente.Localidad !== clienteData.Localidad) updates.Localidad = clienteData.Localidad;
                        if (clienteExistente.CP !== clienteData.CP) updates.CP = clienteData.CP;
                        if (!clienteExistente.Telefono && clienteData.Telefono) updates.Telefono = clienteData.Telefono;

                        if (Object.keys(updates).length > 0) {
                            databaseService.updateCliente(clienteData.Cliente, updates);
                            if (direccionCambio) {
                                clientesConDireccionCambiada++;
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Base de datos actualizada correctamente',
            resumen: {
                clientesAgregados,
                clientesConDireccionCambiada,
                totalProcesados: rows.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;