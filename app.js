var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// DB connection
var mongoose = require('mongoose');
var constants = require('./lib/constants');
mongoose.connect(constants.DB_URL + constants.DB_NAME, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// models
var User = require('./models/user');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret word',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'usernameが登録されていません。' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'passwordが間違っています。' });
      }
      return done(null, user);
    });
  }
));
passport.use('local-signup', new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!!user) {
        return done(null, false, { message: '既に登録されているusernameです。' });
      }
      User.create({
        username,
        password
      })
      .then(function(user) {
        return done(null, user);
      })
      .catch(function(err) {
        console.log(err);
        return done(null, false, { message: '登録エラー' });
      });
    });
  }
));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
