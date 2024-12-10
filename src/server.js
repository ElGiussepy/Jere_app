const express = require('express');
const exphbs = require('express-handlebars');
const uploadRoutes = require('./routes/upload');

const app = express();
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use('/', uploadRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
