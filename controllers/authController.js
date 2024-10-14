const fs = require('fs');
const path = './data/users.json';
const characterModel = require('../models/characterModel');

// Obtener todos los usuarios
const getAllUsers = () => {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
};

// Guardar usuarios
const saveUsers = (users) => {
    fs.writeFileSync(path, JSON.stringify(users, null, 2));
};

// Renderizar la vista de login
exports.showLogin = (req, res) => {
    res.render('login');
};

// Procesar el login o creación de cuenta
exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('El nombre de usuario y la contraseña son requeridos.');
    }

    let users = getAllUsers();
    let user = users.find(u => u.username === username);

    if (!user) {
        // Crear una nueva cuenta
        const newUser = {
            id: users.length + 1,
            username,
            password
        };
        users.push(newUser);
        saveUsers(users);
        user = newUser;
    } else if (user.password !== password) {
        return res.status(400).send('Contraseña incorrecta.');
    }

    // Guardar el usuario en la sesión
    req.session.user = user;

    res.redirect('/');
};

// Cerrar sesión
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
