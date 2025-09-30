require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fileUpload = require('express-fileupload'); // ← Agregar esto
const handlebarsHelpers = require('./helpers/handlebarsHelpers');
// Inicializar base de datos
require('./services/databaseService');

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Configurar Handlebars
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));

// Configurar Handlebars con helpers personalizados
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: handlebarsHelpers // ← Agregar helpers aquí
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para subida de archivos
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  abortOnLimit: true
}));

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes principales
app.use('/', require('./routes/auth'));
app.use('/tools', require('./routes/tools'));
app.use('/clients', require('./routes/clients')); // ← Nueva ruta

// Routes de debug (solo desarrollo)
app.use('/debug', require('./routes/debug'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔧 Debug routes: http://localhost:${PORT}/debug`);
  console.log(`👤 Usuarios cargados: ${require('./services/userService').getAllUsers().length}`);
  console.log(`🔧 Entorno: ${process.env.APP_ENV || 'development'}`);
});