var express = require('express');
var router = express.Router();
var user = require('../models/user');

router.post('/login', function(req, res) {
  	user.login(req.body, res);
});

router.post('/register', function(req, res) {
 	user.register(req.body, res);
});

module.exports = router;