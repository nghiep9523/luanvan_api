var express = require('express');
var router = express.Router();
var driver = require('../models/driver');

router.get('/', function(req, res) {
  driver.getDrivers(res);
});

router.post('/login', function(req, res) {
  	driver.login(req.body, res);
});

router.post('/register', function(req, res) {
 	driver.register(req.body, res);
});


module.exports = router;