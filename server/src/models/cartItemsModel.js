const db = require ('../../data/db');
const { DataTypes } = require('sequelize');

const CartItem = db.define('cart_items', {
    id: {
        type: DataTypes.INTEGER,
        unsigned: true,
        primaryKey: true,
    },
    id_cart: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_funko: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        timestamps: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        timestamps: true,
      }
});

module.exports = CartItem;