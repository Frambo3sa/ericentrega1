const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../database');

const db = {};

// Ler todos os arquivos na pasta models e inicializar os modelos
fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Configurar associações entre os modelos
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exportar a instância do Sequelize e os modelos inicializados
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
