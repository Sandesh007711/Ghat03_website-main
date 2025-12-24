const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const UserToken = require('../models/userTokenModel')
const factory = require('./handlerFactory')
const User = require('../models/userModel')
const Token = require('../models/tokenModel');
const Vehicle = require('../models/vehicleModel');
const Rate = require('../models/rateModel');
const APIfeatures = require('./../utils/apiFeatures')

// Utility function to get the current date in a specific time zone
const getLocalDate = () => {
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options); // YYYY-MM-DD format
    return formatter.format(new Date());
};

// create printToken logic fix
exports.createToken = catchAsync(async (req, res, next) => {
    const { vehicleId, userId } = req.body;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        const loggedUser = user._id.toString().trim();
        if (!user) return next(new AppError(`User not found.`, 400));

        const vehicle = await Vehicle.findById(vehicleId).select('vehicleType').session(session);
        if (!vehicle) return next(new AppError('Vehicle not found!', 400));

        const rate = await Rate.findOne({ vehicleId }).select('vehicleRate').session(session);
        if (!rate) return next(new AppError(`Rate not found for ${vehicle.vehicleType} !`, 400));

        // console.log(vehicle, rate);
        // return

        // Get today's date in 'YYYY-MM-DD' format for the specified time zone
        const today = getLocalDate();
        const lastTokenDate = user.tokenData.dailyTokens.date
            ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(user.tokenData.dailyTokens.date)
            : null;

        let dailyTokensDate = user.tokenData.dailyTokens.date ? user.tokenData.dailyTokens.date : '';
        let dailyTokensCount = user.tokenData.dailyTokens.count ? user.tokenData.dailyTokens.count : 0;

        // Reset dailyTokens if the date has changed
        if (lastTokenDate !== today) {
            dailyTokensDate = new Date(); // Update to today's date
            dailyTokensCount = 0; // Reset the daily count
        }

        // Increment the daily token count and total token count
        dailyTokensCount += 1;

        // Generate the token number
        const uniqueToken = `${user.username.toUpperCase()}${dailyTokensCount.toString().padStart(2, "0")}`;
    
        // Create the token
        await UserToken.create([
            {
                userId: loggedUser,
                driverName: req.body.driverName,
                driverMobileNo: req.body.driverMobileNo,
                vehicleNo: req.body.vehicleNo,
                // vehicleId: vehicleId,
                vehicleType: vehicle.vehicleType,
                vehicleRate: rate.vehicleRate,
                route: req.body.route,
                quantity: req.body.quantity,
                place: req.body.place,
                challanPin: req.body.challanPin,
                tokenNo: uniqueToken,
                createdAt: new Date(),
                updatedAt: null,
            }
        ], { session });
        
        // Update the user's token data in user main table
        await User.findByIdAndUpdate(userId,
            {
                $set: {
                    'tokenData.dailyTokens.date': dailyTokensDate,
                    'tokenData.dailyTokens.count': dailyTokensCount,
                },
                $inc: { 
                    'tokenData.totalTokens': 1
                },
            },
            { session }
        );
    
        await session.commitTransaction();
        session.endSession();
    
        res.status(200).json({
            status: 'success',
            message: 'Print Token has been created successfully.'
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError(error.message, 500))
    }
});

// get all printtokens
exports.getAllTokens = catchAsync(async (req, res) => {
    const { role } = req.user;
    const { user, updated, loaded, deleted, dateFrom, dateTo } = req.query;

    let filter = {
        deletedAt: null  // Add this line to exclude deleted tokens
    };
    
    if(role !== 'admin') {
        filter.userId =  req.user.id
    }

    if(role === 'admin') {
        if(user) {
            filter.userId = user
        }

        if(loaded) {
            filter.isLoaded = {}
            filter.isLoaded.$eq = true

            if(dateFrom && dateTo) {
                filter.loadedAt = {}
                filter.loadedAt.$gte = dateFrom
                filter.loadedAt.$lte = dateTo
            }
        } else if (updated) {
            filter.updatedAt = {}
            filter.updatedAt.$ne = null

            if(dateFrom && dateTo) {
                filter.updatedAt.$gte = dateFrom
                filter.updatedAt.$lte = dateTo
            }
        } else if (deleted) {
            filter.deletedAt = {}
            filter.deletedAt.$ne = null

            if(dateFrom && dateTo) {
                filter.deletedAt.$gte = dateFrom
                filter.deletedAt.$lte = dateTo
            }
        } else {
            if(dateFrom && dateTo) {
                filter.createdAt = {}
                filter.createdAt.$gte = dateFrom
                filter.createdAt.$lte = dateTo
            }
        }
    }
//added by abhinav, filter for operator
    if(role === 'operator') {
        if(dateFrom && dateTo) {
            filter.createdAt = {}
            filter.createdAt.$gte = dateFrom
            filter.createdAt.$lte = dateTo
        }
    }

    const totalCount = await UserToken.countDocuments(filter);
    // Modified by Abhinav: Using default sort from APIfeatures
    const features = new APIfeatures(UserToken.find(filter).populate('userId', {_id: 0, 'username': 1}), req.query)
                    .sort()
                    .paginate()

    const data = await features.query

    res.status(200).json({
        status: 'success',
        message: 'Tokens fetched succesfully',
        data,
        totalCount
    })
});

// get printtoken by id
exports.getToken = factory.getOne(UserToken);

// update printToken
exports.updateToken = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { vehicleId, updateRate } = req.body;    

    const token = await UserToken.findById({ _id: id })
    if(!token) {
        return next(new AppError('Print Token not found', 400))
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return next(new AppError('Vehicle not found!', 400));

    const rate = await Rate.findOne({ vehicleId }).select('vehicleRate');
    if (!rate) return next(new AppError(`Rate not found for ${vehicle.vehicleType} !`, 400));

    token.userId = req.body.userId
    token.driverName = req.body.driverName ? req.body.driverName : token.driverName
    token.driverMobileNo = req.body.driverMobileNo ? req.body.driverMobileNo : token.driverMobileNo
    token.vehicleNo = req.body.vehicleNo ? req.body.vehicleNo : token.vehicleNo
    // token.vehicleId = req.body.vehicleId ? req.body.vehicleId : token.
    token.vehicleType = vehicle.vehicleType
    token.vehicleRate = updateRate ? rate.vehicleRate : token.vehicleRate
    token.quantity = req.body.quantity ? req.body.quantity : token.quantity
    token.place = req.body.place ? req.body.place : token.place
    token.challanPin = req.body.challanPin ? req.body.challanPin : token.challanPin
    token.route = req.body.route ? req.body.route : token.route
    token.updatedAt = new Date(),
    token.updatedBy = req.user.username

    token.save()

    res.status(200).json({
        status: 'success',
        message: 'Tokens updated succesfully'
    })
});

// deleteToken logic fix
exports.deleteToken = catchAsync(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const tokenId = req.params.id;
        const token = await UserToken.findOne({ _id: tokenId }).session(session);
        if (!token) return next(new AppError('Token not found!', 400));

        const userId = token.userId;
        const user = await User.findById(userId).session(session);

        // Ensure daily token count is not reset when a token is deleted
        const today = new Date().toISOString().split('T')[0];
        const tokenCreationDate = token.createdAt.toISOString().split('T')[0];

        if (tokenCreationDate === today && user.tokenData.dailyTokens.date === today) {
            const dailyTokens = Math.max(user.tokenData.dailyTokens.count - 1, 0);
            await User.findByIdAndUpdate(userId, {
                $set: {
                    'tokenData.dailyTokens.count': dailyTokens,
                },
            }, { session });
        }

        const totalTokens = Math.max(user.tokenData.totalTokens - 1, 0);
        await User.findByIdAndUpdate(userId, {
            $set: {
                'tokenData.totalTokens': totalTokens,
            },
        }, { session });

        // Mark the token as deleted
        await UserToken.findByIdAndUpdate(tokenId, {
            $set: {
                deletedAt: new Date(),
            },
        }, { session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }

    res.status(200).json({
        status: 'success',
        message: 'Print Token has been deleted successfully.',
    });
});

exports.getUpdatedTokens = catchAsync(async (req, res) => {
    const data = await UserToken.find({ updatedAt: { $ne: null } }).populate('vehicleId', {_id: 0, 'vehicleType': 1}).populate('userId', {_id: 0, 'username': 1})

    res.status(200).json({
        status: 'success',
        message: 'Updated Tokens fetched succesfully',
        data
    })
});

exports.exitToken = catchAsync(async (req, res, next) => {
    const { _id: userId, role: loggedUserRole } = req.user;
    // change in line 284 const { tokenNo, isLoaded } = req.body; 
    // now the in the payload of exit token we are sending _id and isLoaded done by sandesh
    const { _id, isLoaded } = req.body;
    const token = await UserToken.findOne({ _id });
    if(!token) {
        return next(new AppError('Print Token not found', 400))
    }
    
    // add validation if logged user is owner of token
    if(loggedUserRole !== 'admin')
        if(userId.toString() !== token.userId.toString())
            return next(new AppError('You don\'t have permission to perform this action', 401))

    const today = new Date();
    token.isLoaded = isLoaded;
    token.loadedAt = today;
    token.updatedAt = today;
    token.updatedBy = req.user.username

    token.save()

    res.status(200).json({
        status: 'success',
        message: 'Tokens loaded succesfully'
    })
});

exports.getLoadedList = catchAsync(async (req, res, next) => {
    const totalCount = await UserToken.find({ isLoaded: { $eq: true } }).estimatedDocumentCount();
    const features = new APIfeatures(UserToken.find({ isLoaded: { $eq: true } }), req.query)
                    .sort()
                    .paginate()

    const data = await features.query

    res.status(200).json({
        status: 'success',
        message: 'Updated Tokens fetched succesfully',
        data,
        totalCount
    })
});

exports.getDeletedTokens = catchAsync(async (req, res, next) => {
    const data = await UserToken.find({ deletedAt: { $ne: null } }).populate('vehicleId', {_id: 0, 'vehicleType': 1}).populate('userId', {_id: 0, 'username': 1})

    res.status(200).json({
        status: 'success',
        message: 'Deleted Tokens fetched succesfully',
        data
    })
});