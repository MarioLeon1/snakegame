const characterModel = require('../models/characterModel');

// Mostrar todos los personajes del usuario autenticado
exports.index = (req, res) => {
    const userId = req.session.user.id;  // Obtener el ID del usuario autenticado
    const characters = characterModel.getCharactersByUserId(userId);  // Obtener los personajes del usuario
    res.render('characters/index', { characters });
};

// Renderizar la vista para crear un nuevo personaje
exports.create = (req, res) => {
    res.render('characters/create');
};

// Almacenar un nuevo personaje
exports.store = (req, res) => {
    const userId = req.session.user.id;  // Asignar el personaje al usuario autenticado
    const characters = characterModel.getAllCharacters();
    const newCharacter = {
        id: characters.length + 1,
        name: req.body.name,
        color: req.body.color,
        level: 1,
        userId: userId  // Asociar el nuevo personaje al usuario
    };
    characters.push(newCharacter);
    characterModel.saveCharacters(characters);
    res.redirect('/characters');
};

// Editar un personaje
exports.edit = (req, res) => {
    const character = characterModel.findCharacterById(parseInt(req.params.id));
    if (character.userId !== req.session.user.id) {
        return res.status(403).send('Acceso denegado.');
    }
    res.render('characters/edit', { character });
};

// Actualizar un personaje
exports.update = (req, res) => {
    let characters = characterModel.getAllCharacters();
    const characterIndex = characters.findIndex(c => c.id === parseInt(req.params.id));
    if (characterIndex >= 0 && characters[characterIndex].userId === req.session.user.id) {
        characters[characterIndex] = { ...characters[characterIndex], ...req.body };
        characterModel.saveCharacters(characters);
    }
    res.redirect('/characters');
};

// Eliminar un personaje
exports.delete = (req, res) => {
    let characters = characterModel.getAllCharacters();
    characters = characters.filter(c => c.id !== parseInt(req.params.id) || c.userId !== req.session.user.id);
    characterModel.saveCharacters(characters);
    res.redirect('/characters');
};
