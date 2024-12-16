// app.js
const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = 3000;

// Configuración de Handlebars
app.engine('hbs', engine({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'main',
  }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use('/', indexRoutes);

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});