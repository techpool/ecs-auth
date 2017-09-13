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


function Review (stage) {
	if (stage == 'local') {
		this.url = `http://localhost:8085/social/v2.0/reviews`;
	} else {
		this.url = `${externalEndpoints.SOCIAL_ENDPOINT}/v2.0/reviews`;
	}
}

// Get reviews by ids
Review.prototype.getReviews = function (ids, userId) {
	var that = this;
	return new Promise(function (resolve, reject) {
		var revIds = ids.join();
		var url = that.url+`?id=`+revIds;
        var options = {
          uri: url,
          agent : agent,
          json: true,
          headers: {
              'User-Id': userId
          }
        };
        httpPromise(options)
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        })
        ;
	});
}

module.exports = Review;
