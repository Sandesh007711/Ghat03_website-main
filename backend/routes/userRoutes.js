const express = require('express');
const {
    getAllUsers, createUser, getUser, updateUser, deleteUser, activateUser, deactivateUser, getCurrentUser
} = require('./../controllers/userController');
const authController = require('./../controllers/authController')

const router = express.Router();

router.post('/login', authController.login)
router.get('/logout', authController.logout)

// Protect all routes after this middleware
router.use(authController.protect);

// Route to check current user status (available to all authenticated users)
router.get('/me', getCurrentUser);

// Protect all routes after this middleware for admin user
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(getAllUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

router.patch('/:id/activate', activateUser)
router.patch('/:id/deactivate', deactivateUser)

module.exports = router;