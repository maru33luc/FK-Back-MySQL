const express = require('express');
const router = express.Router();

const { getAllUsers, getUserById, addUser, updateUser, 
    deleteUser, authUser } = require('../controllers/usersControllers');

router.get ('/', getAllUsers);

router.post ('/auth', authUser); // login

router.get ('/:id', getUserById);

router.post ('/',addUser);

router.put ('/:id', updateUser);

router.delete ('/:id',deleteUser);

module.exports = router;