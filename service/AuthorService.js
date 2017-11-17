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


function Author (stage) {
	if (stage == 'local') {
		this.url = 'http://localhost:8095/authors';
	} else {
		this.url = `${externalEndpoints.AUTHOR_ENDPOINT}`;
	}
}

// get Author
Author.prototype.getAuthors = function (ids) {
	console.log('Getting authors for: ',ids);
	var that = this;
	return new Promise(function (resolve, reject) {
		var authorIds = ids.join();
		console.log("The author ids are ", authorIds);
		var url = that.url+"?id="+authorIds;
        var options = {
          method: 'GET',
          uri: url,
          agent : agent
        };
        httpPromise(options)
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject(err);
        })
        ;
	});
}


module.exports = Author;

