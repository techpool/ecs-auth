var http = require('http');
var https = require('https');
var httpPromise = require('request-promise');

var externalEndpoints = require('./../config/externalEndpoints');

var agent = new http.Agent({
  keepAlive : true
});

var httpsAgent = new https.Agent({
  keepAlive : true
});


function User (stage) {
	if (stage == 'local') {
		this.url = 'http://localhost:8095/users';
	} else {
		this.url = `${externalEndpoints.USER_ENDPOINT}`;
	}
}

// get access token
User.prototype.getUserId = function (accessToken) {
	var that = this;
	return new Promise(function (resolve, reject) {
		var url = that.url+"/v2.0/access-tokens/get-userid";
        var options = {
          method: 'GET',
          uri: url,
          agent : agent,
          headers: {
        	  'Access-Token': accessToken
          },
          json: true
        };
        httpPromise(options)
        .then(data => {
          resolve(data.userId);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        })
        ;
	});
}

module.exports = User;

