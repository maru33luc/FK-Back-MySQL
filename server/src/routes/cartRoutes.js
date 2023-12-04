const express = require('express');
const router = express.Router();

const { getCartById, getCartItems, addItemToCart } = require('../controllers/cartControllers');

router.get ('/:id', getCartById);

router.get ('/:id/items', getCartItems);

router.post ('/items', addItemToCart);

router.put ('/items/:id', updateItemInCart);

router.delete ('/items/:id', deleteItemFromCart);

module.exports = router;