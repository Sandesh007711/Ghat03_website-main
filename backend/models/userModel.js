const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    username: {
        type: String, 
        required: [true, 'Please provide operator username'],
        unique: [true, 'Operator with this username alraedy exists.']
    },
    phone: {
        type: Number,
        required: [true, 'Please provide phone number'],
        unique: [true, 'Phone number already exists.']
    },
    route: {
        type: String,
        required: [true, 'Please provide route'],
        unique: [true, 'Route should be unique'],
    },
    role: {
        type: String,
        enum: ['operator', 'admin'],
        default: 'operator'
    },
    tokenData: {
        dailyTokens: {
            date: { type: Date, default: null },
            count: { type: Number, default: 0 },
        },
        totalTokens: { type: Number, default: 0 },
    },
    password: {
        type:String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    rawPassword: {
        type:String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    passwordUpdatedAt: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, { timestamps: true } );

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)

    next()
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.new) { // if we DO NOT MODIFY the password OR if the document is new
        return next();
    }

    this.passwordUpdatedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if(this.passwordUpdatedAt) {
        const chnagedTimestamp = parseInt(this.passwordUpdatedAt.getTime() / 1000, 10)

        return JWTTimestamp < chnagedTimestamp
    }

    // FALSE means NOT changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;