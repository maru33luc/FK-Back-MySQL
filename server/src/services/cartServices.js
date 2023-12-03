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
    getCartById : async (id) => {
        try{
            const cart = await cartModel.findByPk(id);
            return cart;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    getCartItems : async (id) => {
        try{
            const cartItems = await cartItemsModel.findAll({
                where: {
                    id_cart: id
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
    updateItemInCart : async (id, updatedItem) => {
        try{
            const item = await cartItemsModel.findByPk(id);
            await item.update(updatedItem);
            return item;
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    },
    deleteItemFromCart : async (id) => {
        try{
            const item = await cartItemsModel.findByPk(id);
            await item.destroy();
            return {success: 'Se ha eliminado el item'};
        }catch(error){
            console.log(error);
            return {error: 'Ocurrio un error'};
        }
    }

}