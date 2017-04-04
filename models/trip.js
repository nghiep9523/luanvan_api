var sql = require('mssql');
var server = require('../server_config');

function Trip() {
	this.create = function(payload, res) {
		sql.connect(server.config, function (err) {
			const request = new sql.Request();

			request.input('userID', sql.NVarChar, payload.userID);
			request.input('driverID', sql.NVarChar, payload.driverID);
			request.input('tripFrom', sql.NVarChar, payload.from);
			request.input('tripTo', sql.NVarChar, payload.to);
			request.input('fromLong', sql.Int, payload.fromLong);
			request.input('fromLat', sql.Int, payload.fromLat);
			request.input('toLong', sql.Int, payload.toLong);
			request.input('toLat', sql.Int, payload.toLat);

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
}

module.exports = new Trip();