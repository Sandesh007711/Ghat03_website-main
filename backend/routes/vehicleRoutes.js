const express = require('express');
const {
    getAllVehicles, createVehicle, updateVehicleStatus, deleteVehicle, addVehicleRate, updateVehicleRate, deleteVehicleRate,getRates, updateVehicleType
} = require('./../controllers/vehicleController');
const authController = require('./../controllers/authController')

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Protect all routes after this middleware for admin user
router.use(authController.restrictTo('admin','operator'));
router.get('/get-rates', getRates);
router.route('/')
    .get(getAllVehicles)
    .post(createVehicle)

router.route('/:id')
    .patch(updateVehicleStatus)
    .delete(deleteVehicle)

// Add this new route before any other PATCH routes to avoid conflicts
router.patch('/type/:id', updateVehicleType);

// vehicle rate routes
router.route('/:id/rate')
    .post(addVehicleRate)
    .patch(updateVehicleRate)
    .delete(deleteVehicleRate)

module.exports = router;