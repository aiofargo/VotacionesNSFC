const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const app = express();

// Configuración de handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    extname: '.hbs',
    helpers: {
        formatDate: function(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },
        formatFechaInput: function(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        },
        eq: function(v1, v2) {
            return v1 === v2;
        },
        add: function(a, b) {
            return a + b;
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de sesión
app.use(session({
    secret: 'secreto-seguro-aqui',
    resave: false,
    saveUninitialized: false
}));

// Rutas
const homeRoutes = require('./routes/home.routes');
const authRoutes = require('./routes/auth.routes');
const votacionRoutes = require('./routes/votacion.routes');
const candidatoRoutes = require('./routes/candidato.routes');
const votarRoutes = require('./routes/votar.routes');
const resultadosRoutes = require('./routes/resultados.routes');

// La ruta de inicio debe ir primero
app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/votaciones', votacionRoutes);
app.use('/candidatos', candidatoRoutes);
app.use('/votar', votarRoutes);
app.use('/resultados', resultadosRoutes);

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 