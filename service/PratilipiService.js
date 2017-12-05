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



function Pratilipi (stage) {
	if (stage == 'local') {
		this.url = 'http://localhost:8095/pratilipis';
	} else {
		this.url = `${externalEndpoints.PRATILIPI_ENDPOINT}`;
	}
}


//get Pratilipis
Pratilipi.prototype.getPratilipis = function (ids,accessToken) {
	console.log('Getting pratilipis for: ',ids);
	var that = this;
	return new Promise(function (resolve, reject) {
		var pratilipiIds = ids.join();
		var serviceHeaders = {
			    'Service-Id':'AUTH',
			    'Service-Version':'v2.0',
			     'access-token':accessToken
			  };
		console.log("The pratilipi ids are ", pratilipiIds);
		var url = that.url+"?id="+pratilipiIds;
        var options = {
          method: 'GET',
          uri: url,
          agent : agent,
          json : true,
          headers: serviceHeaders
        };
        httpPromise(options)
        .then(data => {
          resolve(data);
        })
        .catch(err => {
		console.log('Error while getting pratilipis',err);
          reject(err);
        });
	});
}

module.exports = Pratilipi;