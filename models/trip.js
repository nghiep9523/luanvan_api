var sql = require('mssql');
var server = require('../server_config');

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
			request.input('fromLong', sql.Int, fromLong);
			request.input('fromLat', sql.Int, fromLat);
			request.input('toLong', sql.Int, toLong);
			request.input('toLat', sql.Int, toLat);
			request.input('createdDate', sql.DateTime, currentDate);

			request.execute('uspCreateTrip', (err, recordsets, returnValue, affected) => {
				if(!err) {
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