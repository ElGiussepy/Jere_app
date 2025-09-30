const express = require('express');
const router = express.Router();

// Ruta principal de Tupperware
router.get('/tupperware', (req, res) => {
  res.render('tupperware', {
    title: 'Tupperware - ' + (process.env.APP_NAME || 'MiWebApp'),
    cssFile: 'tupperware.css'
  });
});

// Ruta de gestión de clientes
router.get('/clientes', (req, res) => {
  res.redirect('/clients');
});

module.exports = router;