const { Sequelize } = require('sequelize');

const db = new Sequelize('funkostore', 'root', 'Maru29luc', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306

});

module.exports = db;