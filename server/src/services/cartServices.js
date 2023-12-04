const cartModel = require('../models/cartModel');
const cartItemsModel = require('../models/cartItemsModel');

module.exports = {
    getCarts : async () => {
        try{
            const carts = await cartModel.findAll();
            return carts;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    createCart : async (userId) => {
        try{
            const carts = await cartModel.findAll();
            const lenght = carts.length;
            const cart = await cartModel.create({id: lenght+1, id_user: userId});
            console.log('cart created', cart);
            return cart;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    getCartById : async (idUser) => {
        try{
            const cart = await cartModel.findOne({
                where: {
                    id_user: idUser
                }
            });
            return cart;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    getCartItems : async (idUser) => {
        try{
            console.log('idUser', idUser);
            const cart = await cartModel.findOne({
                where: {
                    id_user: idUser
                }
            });
            console.log(cart);
            const cartItems = await cartItemsModel.findAll({
                where: {
                    id_cart: cart.dataValues.id
                }
            });
            if (cartItems.length == 0 || cartItems == null) {
                return [];
            }
            console.log('cartItems', cartItems);
            return cartItems;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    addItemToCart : async (idUser, cartItem) => {
        try{
            const cart = await cartModel.findOne({
                where: {
                    id_user: idUser
                }
            });
            const cartItems = await cartItemsModel.findAll({
                where: {
                    id_cart: cart.dataValues.id
                }
            });
            if(cartItems.length == 0 || cartItems == null){
                const item = await cartItemsModel.create({id: 1, id_cart: cart.dataValues.id, id_funko: cartItem.id_funko, cantidad: cartItem.quantity});
                return item;
            }
            const length = cartItems.length;
            const item = await cartItemsModel.create({id: length+1, id_cart: cart.dataValues.id, id_funko: cartItem.id_funko, cantidad: cartItem.quantity, subtotal : 0});
            return item;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    updateItemInCart : async (idUser, updatedItem) => {
        try{
            const cart = await cartModel.findOne({
                where: {
                    id_user: idUser
                }
            });
            const item = await cartItemsModel.findOne({
                where: {
                    id_cart: cart.dataValues.id,
                    id_funko: updatedItem.id_funko
                }
            });
            await item.update(updatedItem);
            return item;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    deleteItemFromCart : async (idUser, idFunko) => {
        try{
            const cart = await cartModel.findOne({
                where: {
                    id_user: idUser
                }
            });
            const item = await cartItemsModel.findOne({
                where: {
                    id_cart: cart.dataValues.id,
                    id_funko: idFunko
                }
            });
            await item.destroy();
            return item;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    }

}