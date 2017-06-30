var server = require('../server_config');
var amqp = require('amqplib/callback_api');
var Client = require('node-rest-client').Client;
var jwt = require('jsonwebtoken');
var apiURL = server.driverAPI;
var secret = server.secret;
var expireTime = '30d';

function Driver() {
	this.login = function(payload, res) {
		var client = new Client();
		
		var args = {
		    data: { username: payload.username, password: payload.password },
		    headers: { "Content-Type": "application/x-www-form-urlencoded" }
		};
		 
		client.post(apiURL + 'login', args, function (data, response) {
			if (data.status == 200) {
				var token = jwt.sign(data.payload, secret, {
		          	expiresIn: expireTime
		        });
		        res.status(200).send({status: 200, payload: data.payload, token: token});
			} else {
				res.status(400).send({status: 400, message: data.message});
			}
		});
	}

	this.register = function(payload, res) {
		var client = new Client();
		 
		var args = {
		    data: { username: payload.username, password: payload.password, email: payload.email, phone: payload.phone, fullname: payload.fullname },
		    headers: { "Content-Type": "application/x-www-form-urlencoded" }
		};
		 
		client.post(apiURL + 'register', args, function (data, response) {
		    if (data.status == 200) {
		        res.status(200).send({status: 200});
			} else {
				res.status(400).send({status: 400, message: data.message});
			}
		});
	}

	this.getCoordInfo = function(res) {
		var client = new Client();
 
		client.get(apiURL+'coordInfo', function (data, response) {
		   if (data.status == 200) {
		        res.status(200).send({status: 200, payload: data.payload});
			} else {
				res.status(400).send({status: 400, message: data.message});
			}
		});
	}

	this.receiveLocationLogs = function() {
		amqp.connect(server.amqpURL, function(err, conn) {
		  	conn.createChannel(function(err, ch) {
			    var ex = 'location_logs';

			    ch.assertExchange(ex, 'direct', {durable: false});

			    ch.assertQueue('', {exclusive: true}, function(err, q) {

				    ch.bindQueue(q.queue, ex, 'location');

				    ch.consume(q.queue, function(msg) {
				        var message = JSON.parse(msg.content.toString());
						var client = new Client();
						var args = {
						    data: { 
						    	driverID: message.driverID,
						    	long: message.longitude,
						    	lat: message.latitude
						    },
						    headers: { "Content-Type": "application/x-www-form-urlencoded" }
						};

						console.log(data);
						 
						client.post(apiURL + 'updateCoord', args, function (data, response) {
						    if (data.status == 200) {
						        console.log("success");
							} else {
								console.log("failed");
							}
						});
				    }, {noAck: true});
			   	});
		  	});
		});
	}

	this.updateDriverStatus = function(payload, res) {
		var client = new Client();
		var args = {
		    data: { driverID: payload.driverID },
		    headers: { "Content-Type": "application/x-www-form-urlencoded" }
		};
		 
		client.post(apiURL + 'updateStatus', args, function (data, response) {
		    if (data.status == 200) {
		        res.status(200).send({status: 200});
			} else {
				res.status(400).send({status: 400, message: data.message});
			}
		});
	}
}

module.exports = new Driver();