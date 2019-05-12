var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/',
  function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  },
  function(req, res, next) {
    var session = req.session;
    res.render('user', { title: 'User page' });
  }
);

module.exports = router;
