var sql = require('mssql');
var bcrypt = require('bcrypt');
var server = require('../server_config');

const saltRounds = 10;

function Driver() {
	this.getDrivers = function(res) {
		sql.connect(server.config, function (err) {
	        if (err) console.log(err);
	        var request = new sql.Request();
	           
	        request.query('select * from driverInfo', function (err, recordset)  {    
	            if (err) console.log(err)
	            res.send(recordset);
	            
	        });
	    });
	}

	this.login = function(payload, res) {
		sql.connect(server.config, function (err) {
			const request = new sql.Request();
			var username = payload.username;
			var inputPassword = payload.password;
			var storedPassword = null;

			request.input('driverUsername', sql.NVarChar, username);

			request.execute('uspLoginDriver', (err, recordsets, returnValue, affected) => {
				if (!err) {
				    storedPassword = recordsets[0][0].driverPassword;
				    console.log(storedPassword);
				    if (bcrypt.compareSync(inputPassword, storedPassword)) {
				    	res.sendStatus(200);
				    } else {
				    	res.status(400).send("Wrong Password!!");
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
			    		res.status(400).send("Username already exist");
			    	} else {
			    		res.status(400).send("Something happened");
			    	}
			    }
			});
		});
	}
}

module.exports = new Driver();