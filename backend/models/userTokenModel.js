const mongoose = require('mongoose');

const UserTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Token should belong to an operator!']
    },
    driverName: {
        type: String,
        required: [true, 'Please provide driver name.']
    },
    driverMobileNo: {
        type: Number,
        required: [true, 'Please provide driver mobile number.']
    },
    vehicleNo: {
        type: String,
        required: [true, 'Please provide vehicle number.']
    },
    // vehicleId:{
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Vehicle',
    //     required: [true, 'A token must have a vehicle type.']
    // },
    vehicleType: {
        type: String,
        // required: [true, 'A token must have a vehicle type.']
    },
    vehicleRate: {
        type: Number,
        // required: [true, 'A token must have a vehicle type.']
    },
    route: {
        type: String, 
        required: [true, 'Please provide route'],
        // unique: [true, 'Route should be unique'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity.']
    },
    place: {
        type: String,
        // required: [true, 'Please provide place.']
    },
    challanPin: {
        type: String,
        // required: [true, 'Please provide challan pin.']
    },
    tokenNo: {
        type: String,
    },
    isLoaded: {
        type: Boolean,
        default: false,
    },
    loadedAt: {
        type: Date,
        default: null
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    },
    updatedBy: {
        type: String,
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: String,
    }
}, { timestamps: {
    createdAt: true,
    updatedAt: false,
    deletedAt: false,
    loadedAt: false,
} });

UserTokenSchema.pre('save', function (next) {
    if(this.isNew) {        
        this.updatedAt = null
    }
    next()
})

// UserTokenSchema.pre(/^find/, function (next) {
//     this.find().populate('vehicleId', {_id: 0, 'vehicleType': 1}).populate('userId', {_id: 0, 'username': 1})
//     next();
// })

UserTokenSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } }).select('-__v');
    next();
});

// Create a model based on the schema
const UserToken = mongoose.model('UserToken', UserTokenSchema);

module.exports = UserToken;