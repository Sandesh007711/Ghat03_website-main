const AppError = require('./../utils/appError')

const handleJWTError = () => new AppError('Invalid Token. Please login again', 401)

const handleJWTExpiredError = () => new AppError('Your token is expired. Please login again', 401)

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}` 
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value ${value}. Please ue another value`
    return new AppError(message, 400)
}

const handleValidationErrorsDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invlid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const sendErrorDevelopment = (err, req, res) => {
    // FOR APIs
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            err: err,
            message: err.message,
            stack: err.stack
        })
    }
    // RENDERED WEB PAGES
    console.error('Error: ', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
}

const sendErrorProduction = (err, req, res) => {
    // FOR APIs
    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) { // operational errors: trusted error, send to client
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }
        // programming or unknown error: don't leak to cliet
        // 1. console the err
        console.error('Error: ', err);

        // 2. send generic response
        return res.status(500).json({
            status: 500,
            message: 'Someting went wrong! Please refresh and try again.'
        })
    }
    // RENDERED WEB PAGES
    if(err.isOperational) { // operational errors: trusted error, send to client
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    }
    // programming or unknown error: don't leak to cliet
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later'
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    // We're gonna implement some logic in order to send different error messages for the development and production environment.
    if(process.env.NODE_ENV === 'development') {
        sendErrorDevelopment(err, req, res)
    // } else if(process.env.NODE_ENV === "production") {
    } else {
        // let error = { ...err }
        let error = {...err, name: err.name, errmsg: err.errmsg, message:err.message}
        if(error.name === 'CastError') error = handleCastErrorDB(error)
        if(error.code === 11000) error = handleDuplicateFieldsDB(error)
        if(error.name === 'ValidationError') error = handleValidationErrorsDB(error)

        if(error.name === 'JsonWebTokenError') error = handleJWTError()
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError()

        sendErrorProduction(error, req, res)
    }
    // else {
    //     console.log(`ENV: ${process.env.NODE_ENV}`)
    // }
}