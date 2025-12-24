const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    vehicleType: {
        type: String,
        required: [true, 'Please provide vehicle type.'],
        unique: [true, 'Vehicle type should be unique.']
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, { timestamps: true })

VehicleSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } }).select('-__v');
    next();
});

// Create a model based on the schema
const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;