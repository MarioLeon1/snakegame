const express = require('express');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');  // Nueva dependencia para manejar sesiones
const characterController = require('./controllers/characterController');
const gameController = require('./controllers/gameController');
const authController = require('./controllers/authController');  // Nuevo controlador
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuración de sesión
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false
}));

// Middleware para pasar la sesión de usuario a todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user;  // Si hay un usuario en sesión, pasarlo a las vistas
    next();
});

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');  // Redirigir a login si no está autenticado
    }
};

// Root route
app.get('/', (req, res) => {
    res.redirect('/game');
});

// Login routes
app.get('/login', authController.showLogin);
app.post('/login', authController.login);
app.get('/logout', authController.logout);

// CRUD routes for characters (protegidas por autenticación)
app.get('/characters', isAuthenticated, characterController.index);
app.get('/characters/new', isAuthenticated, characterController.create);
app.post('/characters', isAuthenticated, characterController.store);
app.get('/characters/:id/edit', isAuthenticated, characterController.edit);
app.post('/characters/:id/update', isAuthenticated, characterController.update);
app.post('/characters/:id/delete', isAuthenticated, characterController.delete);

// Game routes (protegidas por autenticación)
app.get('/game', isAuthenticated, gameController.view);
app.get('/game/select', isAuthenticated, gameController.select);
app.post('/game/select', isAuthenticated, gameController.chooseCharacter);
app.put('/game/update', isAuthenticated, gameController.updateEnergy);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
