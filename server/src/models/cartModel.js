const db = require ('../../data/db');
const { DataTypes } = require('sequelize');

const Cart = db.define('carts', {
    id: {
        type: DataTypes.INTEGER,
        unsigned: true,
        primaryKey: true,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        timestamps: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        timestamps: true,
      }
});

module.exports = Cart;