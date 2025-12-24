class AppError extends Error {
    constructor(message, statusCode) {

        // When we extend a parent class, WE CALL super in order to CALL the PARENT CONSTRUCTOR,
        super(message) // message is actually the only parameter that the built-in error accepts. By doing we set the message in the Error class (which is the parent here) and so we DO NOT NEED TO write it as this.message

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError;