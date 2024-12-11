const express = require('express');
const exphbs = require('express-handlebars');
const uploadRoutes = require('./routes/upload');
const path = require('path');
const app = express();
app.engine('handlebars', exphbs.engine());
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use('/', uploadRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
