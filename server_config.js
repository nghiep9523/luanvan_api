var sql = require('mssql');
//2.
function ServerConfig() {
	this.config = {
	    server: '89cb38b8-d521-496f-aaba-a72b003f22c3.sqlserver.sequelizer.com',
	    database: 'db89cb38b8d521496faabaa72b003f22c3',
	    user: 'tdgmcttqjhveiwyd',
	    password: 'x6FyKB84fFVptdggFftH36rVjzxj27yD3um4bxLrhuyF7EttjTLoHynAMSpkdXch',
	    port: 1433
	};
	this.amqpURL = 'amqp://imtqjgzz:LQWyhmVxKBMgV6ROObew36G07DUs6ZYZ@white-mynah-bird.rmq.cloudamqp.com/imtqjgzz';
}

module.exports = new ServerConfig();