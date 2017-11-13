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


function Comment (stage) {
	if (stage == 'local') {
		this.url = `http://localhost:8085/social/v2.0/comments`;
	} else {
		this.url = `${externalEndpoints.SOCIAL_ENDPOINT}/v2.0/comments`;
	}
}

// Get comments by ids
Comment.prototype.getComments = function (ids, userId) {
	var that = this;
	return new Promise(function (resolve, reject) {
		var commIds = ids.join();
		var url = that.url+`?id=`+commIds;
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
          reject(err);
        })
        ;
	});
}

module.exports = Comment;
