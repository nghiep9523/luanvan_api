var sql = require('mssql');
var server = require('../server_config');
var amqp = require('amqplib/callback_api');

function Trip() {
	this.create = function(payload, res) {
		sql.connect(server.config, function (err) {
			const request = new sql.Request();

			var currentDate = new Date();
			var fromLong = payload.fromLong;
			var fromLat = payload.fromLat;
			var toLong = payload.toLong;
			var toLat = payload.toLat;

			request.input('userID', sql.NVarChar, payload.userID);
			request.input('driverID', sql.NVarChar, payload.driverID);
			request.input('tripFrom', sql.NVarChar, payload.tripFrom);
			request.input('tripTo', sql.NVarChar, payload.tripTo);
			request.input('fromLong', sql.Decimal(9, 6), fromLong);
			request.input('fromLat', sql.Decimal(9, 6), fromLat);
			request.input('toLong', sql.Decimal(9, 6), toLong);
			request.input('toLat', sql.Decimal(9, 6), toLat);
			request.input('createdDate', sql.DateTime, currentDate);

			request.execute('uspCreateTrip', (err, recordsets, returnValue, affected) => {
				if(!err) {
					console.log(server.amqpURL);
					amqp.connect(server.amqpURL , function(err, conn) {
						conn.createChannel(function(err, ch) {
							var ex = 'trip_logs';
							var id = payload.driverID;
							var msg = recordsets[0];

							console.log(msg);

							ch.assertExchange(ex, 'direct', {durable: false});
							ch.publish(ex, id, new Buffer(JSON.stringify(msg)));
						});
						setTimeout(function() { conn.close(); }, 500);
					});
			    	res.sendStatus(200);
			    } else {
			    	if (err.number == 2627) {
			    		res.status(400).send({status: 400, message: "Trip already exist"});
			    	} else {
			    		res.status(400).send({status: 400, message: "Something happened, please try again"});
			    	}
			    }
			});
		});
	}

	this.getTripInfo = function(payload, res) {
		sql.connect(server.config, function (err) {
			const request = new sql.Request();

			request.input('driverID', sql.NVarChar, payload.driverID);

			request.execute('uspGetTripInfo', (err, recordsets, returnValue, affected) => {
				if(!err) {
			    	res.status(200).send({status: 200, payload: recordsets[0]});
			    } else {
			    	res.status(400).send({status: 400, message: "Something happened, please try again"});
			    }
			});
		});
	}
}

module.exports = new Trip();