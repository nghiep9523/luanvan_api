var express = require('express');
var router = express.Router();
var trip = require('../models/trip');

router.post('/create', function(req, res) {
  	trip.create(req.body, res);
});

router.post('/getTrip', function(req, res) {
  	trip.getTripInfo(req.body, res);
});
module.exports = router;