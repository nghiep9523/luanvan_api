var sql = require('mssql');
var bcrypt = require('bcrypt');
var server = require('../server_config');

const saltRounds = 10;

function User() {
	this.login = function(payload, res) {
		sql.connect(server.config, function (err) {
			const request = new sql.Request();
			var username = payload.username;
			var inputPassword = payload.password;
			var storedPassword = null;

			request.input('username', sql.NVarChar, username);

			request.execute('uspLoginPassenger', (err, recordsets, returnValue, affected) => {
				if (!err) {
				    if (!recordsets[0][0]) {
				    	res.status(400).send("Username doesn't exist!!");
				    } else {
				    	storedPassword = recordsets[0][0].password;
				    	if (bcrypt.compareSync(inputPassword, storedPassword)) {
				    		res.sendStatus(200);
				    	} else {
				    	res.status(400).send("Wrong Password!!");
				    	}
				    }
				} else {
					res.status(400).send(err);
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
			var userID = bcrypt.hashSync(username, salt);
			var password = bcrypt.hashSync(password, salt);

			request.input('userID', sql.NVarChar, userID);
			request.input('username', sql.NVarChar, username);
			request.input('password', sql.NVarChar, password);
			request.input('email', sql.NVarChar, email);
			request.input('fullname', sql.NVarChar, fullname);
			request.input('phone', sql.NVarChar, phone);
			request.input('createdDate', sql.DateTime, currentDate);

			request.execute('uspRegisteruser', (err, result) => {
			    if(!err) {
			    	res.sendStatus(200);
			    } else {
			    	if (err.number == 2627) {
			    		res.status(400).send("Username already exist");
			    	} else {
			    		res.status(400).send("Something happened");
			    	}
			    }
			});
		});
	}
}

module.exports = new User();