// command for debugging: DEBUG=asmcamp-backend:* npm start
// https://stackoverflow.com/questions/36240385/explanation-for-what-debug-myapp-npm-start-is-actually-doing

const express = require('express');
const app = express();

const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const dotenv = require('dotenv').config({ path: '/home/osahon/vscode_ws/ASMCamp ECNG 3020/asmcamp-backend/.env' });
// from here, path.join(__dirname + '.env') gives: '/home/osahon/vscode_ws/ASMCamp ECNG 3020/asmcamp-backend/api/v1.env'

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const getDataAPIRouter = require('./routes/api/v1/getDataRouter');
const postDataAPIRouter = require('./routes/api/v1/postDataRouter');

const corsOptions = {
  origin: 'https://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204

}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors(corsOptions));  // handle CORS pre-flight
app.use(logger('dev'));
app.use(express.json());  // for parsing application/json
app.use(express.urlencoded({ extended: false }));  // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1/view', getDataAPIRouter);
app.use('/api/v1/post', postDataAPIRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
