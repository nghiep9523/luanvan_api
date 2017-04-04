var sql = require('mssql');
var bcrypt = require('bcrypt');
var server = require('../server_config');

const saltRounds = 10;

function Driver() {
	this.login = function(payload, res) {
		sql.connect(server.config, function (err) {
			const request = new sql.Request();
			var username = payload.username;
			var inputPassword = payload.password;
			var storedPassword = null;
			var data = null;

			request.input('driverUsername', sql.NVarChar, username);

			request.execute('uspLoginDriver', (err, recordsets, returnValue, affected) => {
				if (!err) {
				    if (!recordsets[0][0]) {
				    	res.status(400).send({status: 400, message:"Username doesn't exist!!"});
				    } else {
				    	storedPassword = recordsets[0][0].driverPassword;
				    	data = recordsets[0][0];
				    	delete data['driverPassword'];
				    	if (bcrypt.compareSync(inputPassword, storedPassword)) {
				    		res.status(200).send({status: 200, payload: data});
				    	} else {
				    		res.status(400).send({status: 400, message: "Wrong Password!!"});
				    	}
				    }
				} else {
					res.status(400).send({status: 400, message: "Something happened, please try again"});
				}
			});
		});
	}

	this.register = function(payload, res) {
		sql.connect(server.config, function (err) {
			var request = new sql.Request();
			var username = payload.username;
			var password = payload.password;
			var email = payload.email;
			var fullname = payload.fullname;
			var phone = payload.phone;
			var currentDate = new Date();
			var salt = bcrypt.genSaltSync(saltRounds);
			var driverID = bcrypt.hashSync(username, salt);
			var password = bcrypt.hashSync(password, salt);

			request.input('driverID', sql.NVarChar, driverID);
			request.input('driverUsername', sql.NVarChar, username);
			request.input('driverPassword', sql.NVarChar, password);
			request.input('driverEmail', sql.NVarChar, email);
			request.input('driverFullname', sql.NVarChar, fullname);
			request.input('driverPhone', sql.NVarChar, phone);
			request.input('createdDate', sql.DateTime, currentDate);

			request.execute('uspRegisterDriver', (err, result) => {
			    if(!err) {
			    	res.sendStatus(200);
			    } else {
			    	if (err.number == 2627) {
			    		res.status(400).send({status: 400, message:"Username already exist"});
			    	} else {
			    		res.status(400).send({status: 400, message: "Something happened please try again"});
			    	}
			    }
			});
		});
	}

	this.getCoordInfo = function(res) {
		sql.connect(server.config, function (err) {
			var request = new sql.Request();
			var payload = null;
			
			request.execute('getDriversCoorInfo', (err, result) => {
			    if(!err) {
			    	payload = result[0]
			    	res.status(200).send({status: 200, payload: payload});
			    } else {
			    	res.status(400).send({status: 400, message: err});
			    }			    
			});
		});
	}
}

module.exports = new Driver();