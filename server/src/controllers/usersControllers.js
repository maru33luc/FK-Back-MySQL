const userServices = require('../services/userServices');

module.exports = {
    getAllUsers: async(req, res) => {
        try{
            const users = await userServices.getAllUsers();
            res.json(users);
        }catch(error){
            console.log(error);
            res.json({error: 'Ocurrio un error'});
        }
    },
    getUserById: async (req, res) => {
        try{
            const user = await userServices.getUserById(req.params.id);
            res.json(user);
        }
        catch(error){
            console.log(error);
            res.json({error: 'Ocurrio un error'});
        }
    },
    addUser: async (req, res) => {
        try{
            const user = await userServices.addUser(req.body);
            res.json(user);
        }catch(error){
            console.log(error);
            res.json({error: 'Ocurrio un error'});
        }
    },
    updateUser: async (req, res) => {
        try{
            const user = await userServices.updateUser(req.params.id, req.body);
            res.json(user);
        }catch(error){
            console.log(error);
            res.json({error: 'Ocurrio un error'});
        }
    },
    deleteUser: async (req, res) => {
        try{
            const user = await userServices.deleteUser(req.params.id);
            res.json(user);
        }catch(error){
            console.log(error);
            res.json({error: 'Ocurrio un error'});
        }
    },
    authUser : async (req, res) => {
        try{
            const email = req.body.email;
            const password = req.body.password;
            const user = await userServices.getUserByEmailAndPassword(email, password);
            res.json(user);
        }catch(error){
            console.log(error);
            res.json({error: 'Ocurrio un error'});
        }
    }
}