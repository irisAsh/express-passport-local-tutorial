var express = require('express');
var router = express.Router();
var passport = require('passport')
// models
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Passport Local Tutorial' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign Up Page' });
});

router.post('/signup', passport.authenticate('local-signup', 
  {
    successRedirect: '/users',
    failureRedirect: '/signup',
    session: true
  }
));

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login Page' });
});

router.post('/login', passport.authenticate('local', 
  {
    successRedirect: '/users',
    failureRedirect: '/login',
    session: true
  }
));

module.exports = router;
