const express = require('express');
const userService = require('../services/userService');
const router = express.Router();

// Ruta principal - muestra el formulario de login
router.get('/', (req, res) => {
  res.render('home', {
    title: process.env.APP_NAME || 'Iniciar Sesión',
    cssFile: 'home.css',
    error: null
  });
});

// Ruta para procesar el login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verificar credenciales usando el servicio
  const user = userService.validateUser(username, password);
  
  if (user) {
    // Login exitoso - redirigir al dashboard
    res.render('dashboard', {
      title: 'Dashboard - ' + (process.env.APP_NAME || 'MiWebApp'),
      cssFile: 'dashboard.css',
      username: username
    });
  } else {
    // Login fallido
    res.render('home', {
      title: process.env.APP_NAME || 'Iniciar Sesión',
      cssFile: 'home.css',
      error: 'Usuario o contraseña incorrectos'
    });
  }
});

// Ruta del dashboard
router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard - ' + (process.env.APP_NAME || 'MiWebApp'),
    cssFile: 'dashboard.css',
    username: 'Usuario' // En un futuro aquí iría la sesión
  });
});

module.exports = router;