const characterModel = require('../models/characterModel');
const gameModel = require('../models/gameModel');

// Mostrar la página de selección de personajes
exports.select = (req, res) => {
    const userId = req.session.user.id;  // Obtener el ID del usuario autenticado
    const characters = characterModel.getCharactersByUserId(userId);  // Obtener los personajes del usuario
    res.render('characters/select', { characters });
};

// Manejar la selección de un personaje para el juego
exports.chooseCharacter = (req, res) => {
    const gameState = gameModel.getGameState();
    gameState.characterId = parseInt(req.body.characterId);
    gameModel.saveGameState(gameState);
    // Redirigir a la página principal después de seleccionar un personaje
    res.redirect('/game');
};

// Mostrar la vista del juego
exports.view = (req, res) => {  
    let gameState = gameModel.getGameState();

    // Si no hay un personaje seleccionado, tomar el primer personaje del usuario autenticado
    if (!gameState.characterId) {
        const userId = req.session.user.id;  // Obtener el ID del usuario autenticado
        const characters = characterModel.getCharactersByUserId(userId);
        if (characters.length > 0) {
            gameState.characterId = characters[0].id; // Seleccionar el primer personaje del usuario
            gameModel.saveGameState(gameState); // Guardar el nuevo estado
        }
    }

    const character = characterModel.findCharacterById(gameState.characterId);
    res.render('game', { character });
};

// Actualizar el nivel de energía dinámicamente (REST API)
exports.updateEnergy = (req, res) => {
    const gameState = gameModel.getGameState();
    const character = characterModel.findCharacterById(gameState.characterId);

    const action = req.body.action;

    switch (action) {
        case 'feed': // Dar de comer
            character.energyLevel = Math.min(100, character.energyLevel + 10); // Aumentar el nivel de energía
            break;
        case 'play': // Jugar
            character.energyLevel = Math.max(0, character.energyLevel - 10); // Reducir el nivel de energía
            break;
        default:
            return res.status(400).json({ message: 'Acción no válida' });
    }

    characterModel.saveCharacter(character); // Guardar el estado actualizado del personaje
    res.json({ energyLevel: character.energyLevel }); // Responder con el nuevo nivel de energía
};

// Actualizar el nivel del personaje dinámicamente
exports.updateCharacterLevel = (characterId, newLevel) => {
    const characters = characterModel.getAllCharacters();
    const characterIndex = characters.findIndex(c => c.id === characterId);

    if (characterIndex !== -1) {
        characters[characterIndex].level = newLevel;
        characterModel.saveCharacters(characters);
    }
};

// Manejar la actualización del nivel del personaje (API REST para ser llamada desde el juego)
exports.updateLevel = (req, res) => {
    const { characterId, level } = req.body;
    if (characterId && level) {
        exports.updateCharacterLevel(characterId, level);
        res.status(200).json({ message: 'Nivel actualizado correctamente.' });
    } else {
        res.status(400).json({ message: 'Faltan parámetros necesarios.' });
    }
};

// Volver al menú principal
exports.backToMenu = (req, res) => {
    const gameState = gameModel.getGameState();
    const character = characterModel.findCharacterById(gameState.characterId);
    if (character) {
        character.level = gameState.level || character.level;  // Registrar el nivel actual del personaje
        characterModel.saveCharacter(character);
    }
    res.redirect('/');
};

// Crear un nuevo personaje
exports.createCharacter = (req, res) => {
    const { name, color } = req.body;
    const userId = req.session.user.id;  // Asignar el personaje al usuario autenticado

    if (name && color) {
        const characters = characterModel.getAllCharacters();
        const newCharacter = {
            id: characters.length + 1,
            name: name,
            color: color,
            level: 1,
            userId: userId  // Asociar el nuevo personaje al usuario autenticado
        };
        characters.push(newCharacter);
        characterModel.saveCharacters(characters);

        // Actualizar el estado del juego para jugar con el personaje creado
        const gameState = gameModel.getGameState();
        gameState.characterId = newCharacter.id;
        gameModel.saveGameState(gameState);

        // Redirigir a la página principal con el nuevo personaje seleccionado
        res.redirect('/game');
    } else {
        res.status(400).json({ message: 'Faltan parámetros necesarios para crear un personaje.' });
    }
};
