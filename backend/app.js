const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const vehicleRouter = require('./routes/vehicleRoutes');
const userTokenRouter = require('./routes/userTokenRoutes');

const app = express();

// CORS Configuration - Must be before other middleware
app.use(
  cors({
    origin: 'http://localhost:5175',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With'
    ]
  })
);

// Add CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5175');
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 1000,
  message: 'To many requests from this IP, please try again in a hour!'
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ** DATA SANITIZATION against NOSQL query injection
app.use(mongoSanitize());

// ** DATA SANITIZATION against XSS
app.use(xssClean());

// So this here will then return a middleware function
// which is then again going to compress all the text that is sent to clients.
app.use(compression());

// Prevent PARAMETER POLLUTION
const whiteList = [
  'duration',
  'ratingsQuantity',
  'ratingsAverage',
  'maxGroupSize',
  'difficulty',
  'price'
];
app.use(
  hpp({
    whitelist: whiteList
  })
);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/tokens', userTokenRouter);

// HANDLE UNHANDLES ROUTES
// The idea is that if we are able to reach this point where app.all() is running, then it means that the request-response cycle was not yet finished at this point in our code, right. Because remember that middleware is added to the middleware stack in the order that it's defined here in our code. And so basically this code here runs first, and so if the route was matched here in our userRoute then our request would never even reach this code, and so then this would not get executed. And so this should basically be the last part after all our other routes, all right.
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

/**
 * global exception handling
 *
 * To define an error handling middleware, all we need to do is to give the middleware function four arguments and
 * Express will then automatically recognize it as an error handling middleware.
 */

app.use(globalErrorHandler);

module.exports = app;
