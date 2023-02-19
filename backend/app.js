var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug');

var cors = require('cors');
var csurf = require('csurf');
var { isProduction } = require('./config/keys');

require('./models/User');
require('./models/Tweet');
require('./config/passport');
var passport = require('passport');
var usersRouter = require('./routes/api/users');
var tweetsRouter = require('./routes/api/tweets');
var csrfRouter = require('./routes/api/csrf')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());


// Security Middleware
if (!isProduction) {
   // Enable CORS only in development because React will be on the React
   // development server (http://localhost:3000). (In production, the Express 
   // server will serve the React files statically.)
   app.use(cors());
}

app.use(
   csurf({
      cookie: {
         secure: isProduction,
         sameSite: isProduction && "Lax",
         httpOnly: true
      }
   })
);


app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);
app.use('/api/csrf', csrfRouter);

app.use((req, res, next) => {
   const err = new Error('Not Found');
   err.statusCode = 404;
   next(err);
})

const serverErrorLogger = debug('backend:error');

app.use((err, req, res, next) => {
   serverErrorLogger(err);
   const statusCode = err.statusCode || 500;
   res.status(statusCode);
   res.json({
      message: err.message,
      statusCode,
      errors: err.errors
   })
});

module.exports = app;
