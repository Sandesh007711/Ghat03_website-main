const dotenv = require('dotenv'); //sandesh
const mongoose = require('mongoose');
const app = require('./app');

// Handle UNCAUGHT EXCEPTIONS that are not caought by our global error handler
// NOTE: IN case of this we need to shut the application because the node application is in UNCLEAN STATE
// AND TO FIX THAT THE SERVER NEEDS TO SHUTDOWN AND RESTART

// WE SHOULD LISTENING FOR UNCAUGHT EXCEPTIONS AT THE VERY TOP
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception! 💥 Shutting Down ...');
  process.exit(1); // 0 stands for success and 1 stand for uncaught exceptions
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    //   useNewUrlParser: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8000; // Changed default port to 800999
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}`);
});

// Handle unhandled rejections that are not caought by our global error handler
// Here, We basically are listening to Unhandled Rejection event which then allow us to hanle all the
// Error happen in out ASYNCHRONOUS CODE which were not previouslly handled
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection !!! Shutting Down 💥 ...');
  // process.exit(1) // 0 stands for success and 1 stand for uncaught exceptions
  server.close(() => {
    process.exit(1); // 0 stands for success and 1 stand for uncaught exceptions
  });
});
