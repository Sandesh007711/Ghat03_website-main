const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
    vehicleId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Rate must have a vehicle type.'],
        unique: [true, 'Rate already present for this Vehicle type.']
    },
    vehicleRate: {
        type: Number,
        required: [true, 'Please provide vehicle rate.']
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
    //test
}, { timestamps: true })

RateSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } }).select('-__v');
    next();
});

// Create a model based on the schema
const Rate = mongoose.model('Rate', RateSchema);

module.exports = Rate;