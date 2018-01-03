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

function Author (stage) {
	this.stage = stage;
	if (stage == 'local') {
		this.url = 'http://localhost:8095/authors';
	} else {
		this.url = `${externalEndpoints.AUTHOR_ENDPOINT}`;
	}
}

// get Authors
Author.prototype.getAuthors = function (ids) {
	console.log('Getting authors for: ',ids);
	var that = this;
	if (this.stage == 'local') {
		return new Promise(function (resolve, reject) {
			var authors = [{
				"authorId": 98765,
				"userId": 12345,
				"language": "HINDI"
			}];
			resolve(authors);
		});
	} else {
		return new Promise(function (resolve, reject) {
			var authorIds = ids.join();
			var url = that.url+"/meta_data?id="+authorIds;
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
			console.log('Error while getting authors',err);
	          reject(err);
	        });
		});
	}
}

// get Author
Author.prototype.getAuthor = function (id) {
	console.log('Getting author for: ',id);
	var that = this;
	if (this.stage == 'local') {
		return new Promise(function (resolve, reject) {
			var authors = {
				"authorId": 98765,
				"userId": 12345,
				"language": "HINDI"
			};
			resolve(authors);
		});
	} else {
		return new Promise(function (resolve, reject) {
			var url = that.url+"/meta_data?id="+id;
	        var options = {
	          method: 'GET',
	          uri: url,
	          agent : agent,
	          json : true,
	          headers: serviceHeaders
	        };
	        httpPromise(options)
	        .then(data => {
	          resolve(data[0]);
	        })
	        .catch(err => {
			console.log('Error while getting author',err);
	          reject(err);
	        });
		});
	}
}


// Get author by slug
Author.prototype.getAuthorsBySlug = function (slug) {
	console.log('Getting author for: ',slug);
	var that = this;
	if (this.stage == 'local') {
		return new Promise(function (resolve, reject) {
			var author = {
				"authorId": 98765,
				"userId": 12345,
				"language": "HINDI"
			};
			resolve(author);
		});
	} else {
		return new Promise(function (resolve, reject) {
			var url = that.url;
	        var options = {
	          method: 'GET',
	          uri: url,
	          qs: {
	          	slug:slug
	          },
	          agent : agent,
	          json : true,
	          headers: serviceHeaders
	        };
	        httpPromise(options)
	        .then(data => {
	          resolve(data);
	        })
	        .catch(err => {
			console.log('Error while getting author',err);
	          reject(err);
	        });
		});
	}
}

module.exports = Author;

