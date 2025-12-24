const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

exports.createOne = (Model) => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    return res.status(201).json({
        status: 'success',
        data: {
            data: newDoc
        }
    })
})

exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)
    if(!document) {
        return next(new AppError('Please provide a valid document ID.', 400))
    }
    res.status(204).json({
        status: 'success' 
    })
})

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        // rawResult: true,
        runValidators: true // here we specify that the validators should be run again.
    })

    if(!doc) {
        return next(new AppError('Please provide a valid document ID.', 400))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        } 
    })
})

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    const data = await Model.find();

    res.status(200).json({
        status: 'success',
        data
    })
})

exports.getOne = (Model) => catchAsync(async (req, res, next) => {
    const data = await Model.findById(req.params.id)

    res.status(200).json({
        status: 'success',
        data
    })
})