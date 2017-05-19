var server = require('../server_config');
var jwt = require('jsonwebtoken');
var Client = require('node-rest-client').Client;
var apiURL = server.customerAPI;
var secret = server.secret;
var expireTime = '30d';

function User() {
	this.login = function(payload, res) {
		var client = new Client();

		var args = {
		    data: { username: payload.username, password: payload.password },
		    headers: { "Content-Type": "application/x-www-form-urlencoded" }
		};
		 
		client.post(apiURL + 'login', args, function (data, response) {
			if (data.status == 200) {
				var token = jwt.sign(data.payload, secret, {
		          	expiresIn: expireTime // expires in 30 days
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
}

module.exports = new User();