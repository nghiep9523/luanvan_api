var sql = require('mssql');
var server = require('../server_config');
var amqp = require('amqplib/callback_api');
var Client = require('node-rest-client').Client;
var apiURL = server.tripAPI;

function Trip() {
	this.create = function(payload, res) {
		var client = new Client();
		var tripData = null;
		var customerData = null;
		var driverData = null;

		var argt = {
		    data: { 
		    	userID: payload.userID,
		     	driverID: payload.driverID,
		     	tripFrom: payload.tripFrom,
		     	tripTo: payload.tripTo,
		     	fromLong: payload.fromLong,
		     	fromLat: payload.fromLat,
		     	toLong: payload.toLong,
		     	toLat: payload.toLat,
		     	price: payload.price
		 	},
		    headers: { "Content-Type": "application/x-www-form-urlencoded" }
		};
		var argc = {
		    data: { 
		    	userID: payload.userID
		 	},
		    headers: { "Content-Type": "application/x-www-form-urlencoded" }
		};
		var argd = {
		    data: { 
		    	driverID: payload.driverID
		 	},
		    headers: { "Content-Type": "application/x-www-form-urlencoded" }
		};
		client.post(server.customerAPI + 'info', argc, function (data, response) {
        	customerData = data.payload;
			if (data.status == 200) {
				client.post(server.driverAPI + 'info', argd, function(data, response) {
					driverData = data.payload;
					if (data.status == 200) {
						client.post(apiURL + 'create', argt, function (data, response) {
							if (data.status == 200) {
								tripData = data.payload;
								var resData = tripData;
								resData['driverFullname'] = driverData.driverFullname;
								resData['driverPhone'] = driverData.driverPhone;
								amqp.connect(server.amqpURL , function(err, conn) {
									conn.createChannel(function(err, ch) {
										var ex = 'notification_logs';
										var id = customerData.userID;
										var msg = resData;

										ch.assertExchange(ex, 'direct', {durable: false});
										ch.publish(ex, id, new Buffer(JSON.stringify(msg)));
									});
									setTimeout(function() { conn.close(); }, 500);
								});
								res.status(200).send({status: 200});
							} else {
								res.status(400).send({status: 400, message: data.message});
							}
						});
					} else {
						res.status(400).send({status: 400, message: "Driver doesn't exist"});
					}
				});
			} else {
				res.status(400).send({status: 400, message: "User doesn't exist"});
			}
		});
	}

	this.getTripInfo = function(payload, res) {
		var client = new Client();
		if (payload.driverID) {
			var tripData = null;
			var customerData = null;
			var argt = {
			    data: { driverID: payload.driverID },
			    headers: { "Content-Type": "application/x-www-form-urlencoded" }			
			};
			var argc = {
				data: { userID: '' },
			    headers: { "Content-Type": "application/x-www-form-urlencoded" }
			}

			client.post(apiURL+'getTrip', argt, function (data, response) {
			   if (data.status == 200) {
			        tripData = data.payload;
			        console.log(data);
			        client.post(server.customerAPI + "info", argc, function (data, response) {
			        	customerData = data.payload;
			        	for (var i = 0; i < tripData.length; i++) {
			        		var pos = customerData.map(function(e) { return e.userID; }).indexOf(tripData[i].userID);
			        		tripData[i]['userFullname'] = customerData[pos].userFullname;
			        		tripData[i]['phone'] = customerData[pos].phone;
			        	}
			        	res.status(200).send({status: 200, payload: tripData});
			        });
				} else {
					res.status(400).send({status: 400, message: data.message});
				}
			});
		} else if (payload.userID) {
			var tripData = null;
			var driverData = null;
			var argt = {
			    data: { userID: payload.userID },
			    headers: { "Content-Type": "application/x-www-form-urlencoded" }			
			};
			var argc = {
				data: { driverID: '' },
			    headers: { "Content-Type": "application/x-www-form-urlencoded" }
			}

			client.post(apiURL+'getTrip', argt, function (data, response) {
			   if (data.status == 200) {
			        tripData = data.payload;
			        client.post(server.driverAPI + "info", argc, function (data, response) {
			        	driverData = data.payload;
			        	for (var i = 0; i < tripData.length; i++) {
			        		var pos = driverData.map(function(e) { return e.driverID; }).indexOf(tripData[i].driverID);
			        		tripData[i]['driverFullname'] = driverData[pos].driverFullname;
			        		tripData[i]['driverPhone'] = driverData[pos].driverPhone;
			        		console.log(tripData);
			        	}
			        	res.status(200).send({status: 200, payload: tripData});
			        });
				} else {
					res.status(400).send({status: 400, message: data.message});
				}
			});
		} else {
			res.status(400).send({status: 400});
		}
	}
}

module.exports = new Trip();