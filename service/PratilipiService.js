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


var serviceHeaders = {
	    'Service-Id':'AUTH',
	    'Service-Version':'v2.0'
	  };


function Pratilipi (stage) {
	this.stage = stage;
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
	serviceHeaders['access-token'] = accessToken;
	if (this.stage == 'local') {
		return new Promise(function (resolve, reject) {
			var pratilipis = [{
			    "pratilipiId": 12345,
			    "title": "pratilipi",
			    "titleEn": "pratilipi",
			    "language": "HINDI",
			    "author": {
			        "authorId": 98765,
			        "name": "admin",
			        "pageUrl": "/ad-min"
			    },
			    "pageUrl": "/ad-min/hi-pratilipi",
			    "state": "DRAFTED",
			    "listingDateMillis": 1490540595169
			}];
			resolve(pratilipis);
		});
	} else {
		return new Promise(function (resolve, reject) {
			var pratilipiIds = ids.join();
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
}

// Get Pratilipis by slug
Pratilipi.prototype.getPratilipisBySlug = function (slug,accessToken) {
	console.log('Getting pratilipis for: ',slug);
	var that = this;
	serviceHeaders['access-token'] = accessToken;
	if (this.stage == 'local') {
		return new Promise(function (resolve, reject) {
			var pratilipis = {
			    "pratilipiId": 12345,
			    "title": "pratilipi",
			    "titleEn": "pratilipi",
			    "language": "HINDI",
			    "author": {
			        "authorId": 98765,
			        "name": "admin",
			        "pageUrl": "/ad-min"
			    },
			    "pageUrl": "/ad-min/hi-pratilipi",
			    "state": "DRAFTED",
			    "listingDateMillis": 1490540595169
			};
			resolve(pratilipis);
		});
	} else {
		return new Promise(function (resolve, reject) {
			var url = that.url+"?slug="+slug;
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
}

module.exports = Pratilipi;