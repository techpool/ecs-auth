// Imports
var express = require('express');
var url = require('url')

// Load Configurations
var config = require( './config/main' )[ process.env.STAGE || 'local'];

// Initialize app
const app = express();
app.set('port', config.PORT);

// Load Services
const AccessTokenService = require('./service/AccessTokenService' )( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const PratilipiService   = require('./service/PratilipiService')( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const AuthorService      = require('./service/AuthorService')( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const UserAccessList     = require('./config/UserAccessUtil.js');
const Language           = require('./config/Language.js').Language;
const AccessType         = require('./config/AccessType.js').AccessType;

// Initialize utilities
const Logging = require( './lib/LoggingGcp.js' ).init({
  projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID,
  service: config.SERVICE
});
const Metric = require( './lib/MetricGcp.js' ).init({
	projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID,
	service: config.SERVICE
});


var validResources = ['/pratilipis','/authors'];
var validMethods   = ['POST','GET','PUT','PATCH','DELETE'];
var Role = UserAccessList.Role;
var AEES = UserAccessList.AEES;
AEES = new AEES();

const latencyMetric = new Metric( 'int64', 'Latency' );

// for initializing log object
app.use((request, response, next) => {
  var log = request.log = new Logging( request );
  request.startTimestamp = Date.now();
  next();
});


//apis to resources mapping
app.use((request, response, next) => {

	var urlParts = url.parse(request.url, true);
    var pathname = urlParts.pathname;
    var isPathMapped = false;
    if (pathname === "/auth/isAuthorized") {
    	var resource = unescape(request.query.resource).replace(/\/[0-9]+/g, "/*");
    	if (resource == "/image/pratilipi/cover" || resource == "/image/pratilipi/*/cover" 
    		|| resource == "/pratilipis/*") {
    		resource = "/pratilipis";
    		isPathMapped = true;
    	} else if (resource == "/image/author/cover" || resource == "/image/author/*/cover"
    		|| resource == "/image/author/profile" || resource == "/image/author/*/profile"
    			|| resource == "/authors/*") {
    		resource = "/authors";
    		isPathMapped = true;
    	}
    	
    	if (isPathMapped) {
    		request.query.originalResource = request.query.resource;
    		request.query.resource = resource;
    		
    		if (request.query.method == 'POST') {
    			request.query.method = 'PATCH';
    			request.query.originalMethod = 'POST';
    		}
    	} 
    }
	next();
});


// Request Handlers
app.get("/health", function (req, res) {
	console.log("Request reached health");
	var message = {"message":"Auth service is running healthy."};
	res.status("200").send(message);
});

function isAuthorizedResponse (resource,method,data) {
	this.resource = resource;
	this.method = method;
	this.data = data;
}

function resourceResponse (code, id, isAuthorized) {
	this.code = code;
	this.id = id;
	this.isAuthorized = isAuthorized;
}

function errorResponse (message) {
	this.message = message;
}

app.get("/auth/isAuthorized", function (req, res) {
	
	// Read Headers
	var accessToken = req.headers['access-token'];
	var userId = req.headers['user-id'];
	
	// Read query parameters
	var resource = unescape(req.query.resource);
	var method = req.query.method;
	var resourceIds = req.query.id;
	var language = req.query.language;
	var authorId = req.query.authorId;
	var state = req.query.state;
	
	var resourceType = null;
	if (authorId != null) {
		resourceIds = authorId;
		resourceType = "AUTHOR";
	}
	
	// Validate query parameters
	if (!validResources.includes(resource) || !validMethods.includes(method)  || (method != 'POST' && resourceIds == null) || (method == 'POST' && language == null)) {
		res.setHeader('content-type', 'application/json');
		res.status(400).send( JSON.stringify(new errorResponse("Invalid parameters")));
		return;
	}
	
	if (method != 'POST'){
		resourceIds = resourceIds.split(',').map(Number);
	}
	
	// Get User-Id for accessToken
	var userIdPromise;
	if (userId == null && accessToken != null) {
		userIdPromise = AccessTokenService
	 	.getUserId( accessToken )
	 	.then( ( id ) => {
	 		console.log("Reading user-id from gcp : "+id);
	 		userId = id;
	 		res.setHeader('User-Id', userId);
	 		return;
	 	})
	 	.catch( ( err ) => {
	 		console.log(err);
	 		return;
	 	});
	} else {
		// TODO: Check if given User-Id is valid
		userIdPromise = new Promise((resolve,reject)=>{
			resolve();
		});
	}
	
	// Get resources by ids
	var resources;
	var resourcePromise = userIdPromise.then (function () {
		
		if (resource == "/pratilipis" && method != "POST" && resourceType == null) {
			return PratilipiService
			.getPratilipis(resourceIds)
			.then ((pratilipis) => {
				resources = pratilipis;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting pratilipi!';
		 		console.log(err);
		 		return;
		 	});
		} else if ((resource == "/authors" && method != "POST") || (resource == "/pratilipis" && method == "GET" && resourceType == "AUTHOR")) {
			return AuthorService
			.getAuthors(resourceIds)
			.then ((authors) => {
				resources = authors;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting authors!';
		 		console.log(err);
		 		return;
		 	});
		}
	});

	
	// Verify authorization
	var data = [];
	var authorizePromise = resourcePromise.then (function () {
		
		// Get roles for the user
		var roles = AEES.getRoles(userId);
		if (resource == "/pratilipis") {
			
			if (resourceType == "AUTHOR") {
				if (resources != null && resources.length > 0) {
					var author = resources[0];
					if (state == "PUBLISHED") {
						data[0] = new resourceResponse(200, author.ID, true);
					}
					else if (state == "DRAFTED") {
						if (userId == author.ID || AEES.hasUserAccess(userId,author.LANGUAGE,AccessType.AUTHOR_PRATILIPIS_READ)) {
							data[0] = new resourceResponse(200, author.ID, true);
						} else {
							data[0] = new resourceResponse(403, author.ID, false);
						} 
					} else {
						data[0] = new resourceResponse(403, author.ID, false);
					}
					
				} else {
					data[0] = new resourceResponse(403, resourceIds[0], false);
				}
			} else {
				 if (method == "POST") {
					var hasAccess = AEES.hasUserAccess(userId, language, AccessType.PRATILIPI_ADD);
					if (hasAccess) {
						data[0] = new resourceResponse(200, 0, true)
					} else {
						data[0] = new resourceResponse(403, 0, false);
					}
				} else {
					var ownerPromises = [];
					for (i = 0; i < resources.length; i++) {
						var pratilipi = resources[i];
						if (pratilipi != null) {
							
							var accessType=null;
							if (method == "GET") {
								accessType = AccessType.PRATILIPI_READ_CONTENT;
							} else if (method == "PUT" || method == "PATCH" ) {
								accessType = AccessType.PRATILIPI_UPDATE;
							} else if (method == "DELETE") {
								accessType = AccessType.PRATILIPI_DELETE;
							}
							
							language = pratilipi.LANGUAGE;
							
							var hasAccess = AEES.hasUserAccess(userId,language,accessType);
							if (hasAccess) {
								if (!AEES.isAEE(userId) && (accessType == AccessType.PRATILIPI_UPDATE || accessType == AccessType.PRATILIPI_DELETE)) {
									ownerPromises.push(isUserAuthorToPratilipi(i,data,userId,pratilipi));
								} else {
									data[i] = new resourceResponse(200,pratilipi.ID,true)
								}
							} else {
								data[i] = new resourceResponse(403,pratilipi.ID,false);
							}
							
						} else {
							data[i] = new resourceResponse(404,resourceIds[i],false);
						}
					}
					return new Promise((resolve,reject)=>{
						Promise.all(ownerPromises).then (function () {
							resolve();
						});
					});
				}
			}
		} else if (resource == "/authors") {
			if (method == "POST") {
				var hasAccess = AEES.hasUserAccess(userId, language, AccessType.AUTHOR_ADD);
				if (hasAccess) {
					data[0] = new resourceResponse(200, 0, true);
				} else {
					data[0] = new resourceResponse(403, 0, false);
				}
			} else {
				for (i = 0; i < resources.length; i++) {
					var author = resources[i];
					if (author != null) {
						
						var accessType=null;
						if (method == "GET") {
							accessType = AccessType.AUTHOR_READ;
						} else if (method == "PUT" || method == "PATCH" ) {
							accessType = AccessType.AUTHOR_UPDATE;
						} else if (method == "DELETE") {
							accessType = AccessType.AUTHOR_DELETE;
						}
						
						language = author.LANGUAGE;
						
						var hasAccess = AEES.hasUserAccess(userId,language,accessType);
						if (hasAccess) {
							if (!AEES.isAEE(userId) && accessType == AccessType.AUTHOR_UPDATE) {
								if (author.USER_ID == userId) {
						        	data[i] = new resourceResponse(200,author.ID,true);
						        } else {
						        	data[i] = new resourceResponse(403,author.ID,false);
						        }
							} else {
								data[i] = new resourceResponse(200,author.ID,true);
							}
						} else {
							data[i] = new resourceResponse(403,author.ID,false);
						}
						
					} else {
						data[i] = new resourceResponse(404,resourceIds[i],false);
					}
				}
			}
		} 
	});
	
	authorizePromise.then (function (){
		console.log("sending response");
		res.setHeader('content-type', 'application/json');
		if (req.query.originalResource != null && req.query.originalResource != "") {
			resource = req.query.originalResource;
		} 
		if (req.query.originalMethod != null && req.query.originalMethod != "") {
			method = req.query.originalMethod;
		}
		res.status(200).send(JSON.stringify(new isAuthorizedResponse(resource,method,data)));
	});

});

function isUserAuthorToPratilipi(index,data,userId,pratilipi) {
	return new Promise( function (resolve,reject) {
		AuthorService.getAuthor(pratilipi.AUTHOR_ID)
	    .then ((author) => {
	        if (author!=null &&  author.USER_ID == userId) {
	        	data[index] = new resourceResponse(200,pratilipi.ID,true);
	        } else {
	        	data[index] = new resourceResponse(403,pratilipi.ID,false);
	        }
	        resolve();
	    }).catch( (err) => {
	    	console.log("Error while fetching authors");
	        console.log(err);
	        reject();  
	    });
	});	
}



// Initialize server
var server = app.listen(app.get('port'), function () {
   var host = server.address().address
   var port = server.address().port
   console.log("The service running on "+host+":"+port);
});


// exports
module.exports = server
