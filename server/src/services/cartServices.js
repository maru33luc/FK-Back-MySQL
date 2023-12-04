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
            const cart = await cartModel.findOne({
                where: {
                    id_user: idUser
                }
            });
            const cartItems = await cartItemsModel.findAll({
                where: {
                    id_cart: cart.id
                }
            });
            return cartItems;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    addItemToCart : async (cartItem) => {
        try{
            const newItem = await cartItemsModel.create(cartItem);
            return newItem;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    updateItemInCart : async (idFunko, updatedItem) => {
        try{
            const item = await cartItemsModel.findOne({
                where: {
                    id_funko: idFunko
                }
            });
            await item.update(updatedItem);
            return item;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    deleteItemFromCart : async (idFunko) => {
        try{
            const item = await cartItemsModel.findOne({
                where: {
                    id_funko: idFunko
                }
            });
            await item.destroy();
            return {success: 'Se ha eliminado el item'};
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    }

}