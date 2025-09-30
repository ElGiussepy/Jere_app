const express = require('express');
const userService = require('../services/userService');
const router = express.Router();

// Middleware para verificar que estamos en desarrollo
const developmentOnly = (req, res, next) => {
  if (process.env.APP_ENV === 'development') {
    next();
  } else {
    res.status(403).json({ 
      error: 'Acceso denegado', 
      message: 'Las rutas de debug solo están disponibles en entorno de desarrollo' 
    });
  }
};

// Aplicar el middleware a todas las rutas de debug
router.use(developmentOnly);

// Debug de usuarios
router.get('/users', (req, res) => {
  try {
    const users = userService.getAllUsers();
    res.json({
      success: true,
      totalUsers: users.length,
      users: users,
      environment: process.env.APP_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug de variables de entorno (sin mostrar valores sensibles)
router.get('/env', (req, res) => {
  const safeEnvVars = {
    APP_NAME: process.env.APP_NAME,
    APP_PORT: process.env.APP_PORT,
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    // No mostramos APP_USERS por seguridad
  };
  
  res.json({
    success: true,
    environmentVariables: safeEnvVars,
    totalUsers: userService.getAllUsers().length
  });
});

// Debug del sistema
router.get('/system', (req, res) => {
  res.json({
    success: true,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Health check extendido
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    service: process.env.APP_NAME || 'MiWebApp',
    version: '1.0.0',
    environment: process.env.APP_ENV,
    timestamp: new Date().toISOString()
  });
});

// Ruta principal de debug con índice
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/debug`;
  
  res.json({
    message: '🔧 Debug Routes Available',
    routes: {
      users: `${baseUrl}/users`,
      environment: `${baseUrl}/env`,
      system: `${baseUrl}/system`,
      health: `${baseUrl}/health`
    },
    documentation: 'Estas rutas solo están disponibles en entorno de desarrollo'
  });
});

module.exports = router;