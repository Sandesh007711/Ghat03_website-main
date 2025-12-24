const express = require('express');
const {
    getAllTokens, createToken, getUpdatedTokens, getToken, updateToken, deleteToken,
    exitToken, 
    getLoadedList,
    getDeletedTokens
} = require('../controllers/userTokenController');
const authController = require('../controllers/authController')

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
    .get(authController.restrictTo('admin', 'operator'), getAllTokens)
    .post(authController.restrictTo('admin', 'operator'), createToken)

router.route('/loaded')
    .post(authController.restrictTo('admin', 'operator'), exitToken)
    .get(authController.restrictTo('admin'), getLoadedList)

router.route('/updated')
    .get(authController.restrictTo('admin'), getUpdatedTokens)

router.route('/deleted')
    .get(authController.restrictTo('admin'), getDeletedTokens)

router.route('/:id')
    .get(authController.restrictTo('admin', 'operator'), getToken)
    .patch(authController.restrictTo('admin'), updateToken)
    .delete(authController.restrictTo('admin'), deleteToken)

module.exports = router;