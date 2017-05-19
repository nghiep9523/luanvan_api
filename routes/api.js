var express = require('express');
var router = express.Router();
var driver = require('../models/driver');
var user = require('../models/user');
var driver = require('../models/driver');
var trip = require('../models/trip');
var jwt = require('jsonwebtoken');
var config = require('../server_config');

router.post('/driver/login', function(req, res) {
  	driver.login(req.body, res);
});

router.post('/driver/register', function(req, res) {
 	driver.register(req.body, res);
});

router.post('/user/login', function(req, res) {
  	user.login(req.body, res);
});

router.post('/user/register', function(req, res) {
 	  user.register(req.body, res);
});

router.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        req.decoded = decoded;    
        next();
      }
    });
  } else {
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});

router.get('/driver/coordInfo', function(req, res) {
 	driver.getCoordInfo(res);
});

router.post('/driver/updateStatus', function(req, res) {
 	driver.updateDriverStatus(req.body, res);
});

router.post('/trip/create', function(req, res) {
  	trip.create(req.body, res);
});

router.post('/trip/getTrip', function(req, res) {
  	trip.getTripInfo(req.body, res);
});
module.exports = router;