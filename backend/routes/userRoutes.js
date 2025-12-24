const express = require('express');
const {
    getAllUsers, createUser, getUser, updateUser, deleteUser
} = require('./../controllers/userController');
const authController = require('./../controllers/authController')

const router = express.Router();

router.post('/login', authController.login)
router.get('/logout', authController.logout)

// Protect all routes after this middleware
router.use(authController.protect);

// Protect all routes after this middleware for admin user
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(getAllUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router;