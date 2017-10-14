// Imports
var express = require('express');
var logger = require('morgan');
var url = require('url')
var co  = require('co');

// Load Configurations
var config = require( './config/main' )[ process.env.STAGE || 'local'];

// Initialize app
const app = express();
app.set('port', config.PORT);

// Load Services
const AccessTokenService = require('./service/AccessTokenService' )( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const UserService        = require('./service/UserService');
const PratilipiService   = require('./service/PratilipiService')( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const AuthorService      = require('./service/AuthorService')( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const ReviewService      = require('./service/ReviewService');
const CommentService     = require('./service/CommentService');
const UserAccessList     = require('./config/UserAccessUtil.js');
const Language           = require('./config/Language.js').Language;
const AccessType         = require('./config/AccessType.js').AccessType;

// Initialize utilities
const Logging = require( './lib/LoggingGcp.js' ).init({
  projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID,
  service: config.SERVICE
});

const cacheUtility = require('./lib/CacheUtility.js')({
 	port : config.REDIS_HOST_PORT,
 	hostIp : config.REDIS_HOST_IP,
 	resource : config.REDIS_KIND,
	db : 3
});

var validResources = ['/pratilipis','/authors','/recommendation/pratilipis','/search/search',
	'/search/trending_search','/follows','/userauthor/follow/list', '/userauthor/follow',
	'/reviews','/userpratilipi','/userpratilipi/review','/userpratilipi/review/list',
	'/comments','/comment','/comment/list',
	'/vote','/votes', '/blog-scraper',
	'/event','/event/list','/events','/event/pratilipi','/devices','/userpratilipi/library','/userpratilipi/library/list','/library'];
var validMethods   = ['POST','GET','PUT','PATCH','DELETE'];
var Role = UserAccessList.Role;
var AEES = UserAccessList.AEES;
AEES = new AEES();
var reviewService = new ReviewService(process.env.STAGE || 'local');
var commentService = new CommentService(process.env.STAGE || 'local');
var userService    = new UserService(process.env.STAGE || 'local');

app.use(logger('short'));

// for initializing log object
app.use((request, response, next) => {
  var log = request.log = new Logging( request );
  request.startTimestamp = Date.now();
  next();
});

//Request Handlers
// API to check health
app.get("/health", function (req, res) {
	console.log("Request reached health");
	var message = {"message":"Auth service is running healthy."};
	res.status("200").send(message);
});


// API to delete accessToken - userId from cache
app.delete("/auth/accessToken", function(req, res){
	console.log("Request to delete access token from cache");
	
	// read headers
	var accessToken = req.headers['access-token'];
	res.setHeader('content-type', 'application/json');
	
	if (accessToken != null) {
	 		cacheUtility.delete( accessToken )
	 		.then(function(){
	 			console.log("successfully deleted access token from cache ");
	 			res.status(200).send(JSON.stringify({"message":"Successfully deleted"}));
	 		})
	 		.catch((err) => {
	 			console.log("Error while deleting access token from cache "+err);
	 			res.status(500).send();
	 		});
	 		
	} else {
		res.status(400).send( JSON.stringify(new errorResponse("Invalid parameters")));
	}
});

//apis to resources mapping
app.use((request, response, next) => {

	var urlParts = url.parse(request.url, true);
    var pathname = urlParts.pathname;
    var isPathMapped = false;
    if (pathname === "/auth/isAuthorized") {
    	var resource = unescape(request.query.resource);
		if (resource.startsWith("/blog-scraper")) {
			resource = resource.replace(/\/[a-f\d]{24}/g, "/*");
		} else {
			resource = resource.replace(/\/[0-9]+/g, "/*");
		}
		
		if (resource == "/image/pratilipi/cover" || resource == "/image/pratilipi/*/cover" 
			|| resource == "/pratilipis/*") {
			resource = "/pratilipis";
			isPathMapped = true;
		} else if (resource == "/image/author/cover" || resource == "/image/author/*/cover"
			|| resource == "/image/author/profile" || resource == "/image/author/*/profile"
				|| resource == "/authors/*") {
			resource = "/authors";
			isPathMapped = true;
		} else if (resource == "/userauthor/follow/list" || resource == "/userauthor/follow") {
			resource = "/follows";
		} else if (resource == "/userpratilipi/library/list" || resource == "/userpratilipi/library") {
			resource = "/library";
		} else if (resource == "/userpratilipi" || resource == "/userpratilipi/review" || resource == "/userpratilipi/review/list") {
			resource = "/reviews";
		} else if (resource == "/comment" || resource == "/comment/list") {
			resource = "/comments";
			if (request.query.method == 'POST' && request.query.commentId != undefined) {
				isPathMapped = true;
			}
		} else if (resource == "/vote") {
			resource = "/votes"
		} else if (resource == "/blog-scraper"
		  || resource == "/blog-scraper/*"
		  || resource == "/blog-scraper/*/create"
		  || resource == "/blog-scraper/*/publish"
		  || resource == "/blog-scraper/*/scrape"
		  || resource == "/blog-scraper/search") {
			resource = "/blog-scraper";
		} else if (resource == "/event" || resource == "/event/list" || resource == "/event/pratilipi") {
			resource = "/events";
		}
    	
		request.query.originalResource = request.query.resource;
		request.query.resource = resource;
		
    	if (isPathMapped) {	
    		if (request.query.method == 'POST') {
    			request.query.method = 'PATCH';
    			request.query.originalMethod = 'POST';
    		} else if (request.query.method == 'DELETE') {
    			request.query.method = 'PATCH';
    			request.query.originalMethod = 'DELETE';
    		}
    	} 
    }
	next();
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

function User (id) {
	this.id = id;
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
	
	
	if (resource == '/reviews') {
		resourceIds = req.query.pratilipiId;
	} else if (resource == '/comments') {
		if (method == 'PATCH') {
			resourceIds = req.query.commentId;
		} else if (method == 'GET') {
			resourceIds = req.query.parentId;
		}
	} else if (resource == '/votes') {
		resourceIds = req.query.parentId;
	} 
	
	if (authorId != null && authorId != 'null' ) {
		resourceIds = authorId;
		resourceType = "AUTHOR";
	} 
	
	if (resource == "/recommendation/pratilipis" 
		|| resource == "/search/search" 
		|| resource == "/search/trending_search" 
		|| (resource == "/follows" && method != "POST")
	   	|| resource == "/blog-scraper" 
	   	|| (resource == "/events" && method == "GET" && resourceIds == null)
	   	|| ( resource == "/library" ) ) {
		resourceIds = "0";
	}
	
	// Validate query parameters
	if (!validResources.includes(resource) 
		|| !validMethods.includes(method)  
		|| (method != 'POST' && resourceIds == null) 
		|| ((resource == "/pratilipis" || resource == "/authors") && method == 'POST' && language == null)) {
		res.setHeader('content-type', 'application/json');
		res.status(400).send( JSON.stringify(new errorResponse("Invalid parameters")));
		return;
	}
	
	if (method != 'POST' 
		|| (resource == "/pratilipis" && resourceType == "AUTHOR") 
		|| (resource == "/follows")
		|| (resource == "/reviews" && method == "POST")){
		resourceIds = resourceIds.split(',').map(Number);
	}

	
	// Get User-Id for accessToken
	var userIdPromise;
	if ((userId == undefined || userId == null) && accessToken != null) {
		userIdPromise = cacheUtility.get(accessToken)
		.then((user) => {
			if( user !== null ) {
	 			userId = user.id;
	 			console.log('Got user-id from cache');
	 			res.setHeader('User-Id', userId);
	 			return userId;
	 		} else {
 				return getFromDB(accessToken,res);
	 		}
		})
		.catch( (err) => {
			console.log('error while fetching user-id from cache');
			return getFromDB(accessToken, res);
		}).then((id) => {
			userId = id;
		});
	} else {
		// TODO: Check if given User-Id is valid
		userIdPromise = new Promise((resolve,reject)=>{
			if (userId == null) {
				res.setHeader('content-type', 'application/json');
				res.status(400).send( JSON.stringify(new errorResponse("Access-Token or User-Id are required in request header")));
				return;
			} else {
				resolve();
			}
			
		});
	}
	
	// Get resources by ids
	var resources;
	var resourcePromise = userIdPromise.then (function () {
		
		console.log("Fetching resources for "+resourceIds);
		
		if ((resource == "/pratilipis" && method != "POST" && resourceType == null) || (resource == "/reviews" && method == "POST")) {
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
		} else if ((resource == "/authors" && method != "POST") || (resource == "/pratilipis" && resourceType == "AUTHOR")
				|| (resource == "/follows" && method == "POST" )) {
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
		} else if ((resource == "/reviews" && (method == "PATCH" || method == "DELETE"))) {
			return reviewService.getReviews(resourceIds, userId)
			.then((reviews) => {
				resources = reviews;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting reviews!';
		 		console.log(err);
		 		return;
		 	});
		} else if ((resource == "/comments" && (method == "PATCH" || method == "DELETE"))) {
			return commentService.getComments(resourceIds, userId)
			.then((comments) => {
				resources = comments;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting comments!';
		 		console.log(err);
		 		return;
		 	});
		}
	});

	
	// Verify authorization
	var data = [];
	var authorizePromise = resourcePromise.then (function () {

		return co(function * () {
			console.log("Verifying the authorization for user on the resource");
			// Get roles for the user
			var roles = AEES.getRoles(userId);
			if (resource == "/pratilipis") {
				
				if (resourceType == "AUTHOR") {
					if (resources != null && resources.length > 0) {
						var author = resources[0];
						if (method == "GET") {
							if (state == "PUBLISHED") {
								data[0] = new resourceResponse(200, author.ID, true);
							}
							else if (state == "DRAFTED") {
								if (userId == author.USER_ID || AEES.hasUserAccess(userId,author.LANGUAGE,AccessType.AUTHOR_PRATILIPIS_READ)) {
									data[0] = new resourceResponse(200, author.ID, true);
								} else {
									data[0] = new resourceResponse(403, author.ID, false);
								} 
							} else {
								data[0] = new resourceResponse(403, author.ID, false);
							}
						} else {
							if (AEES.hasUserAccess(userId,author.LANGUAGE,AccessType.AUTHOR_PRATILIPIS_ADD) || AEES.hasUserAccess(userId,author.LANGUAGE,AccessType.PRATILIPI_ADD)) {
								data[0] = new resourceResponse(200, author.ID, true);
							} else {
								data[0] = new resourceResponse(403, author.ID, false);
							}
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
			} else if (resource == "/follows") { 
				if (method == "POST") {
					var hasAccess = AEES.hasUserAccess(userId, language, AccessType.USER_AUTHOR_FOLLOWING);
					if (hasAccess) {
						var author = resources[0];
						if (author.USER_ID == userId) {
				        	data[0] = new resourceResponse(403,author.ID,false);
				        } else {
				        	data[0] = new resourceResponse(200,author.ID,true);
				        }
					} else {
						data[0] = new resourceResponse(403, resourceIds[0], false);
					}
					
				} else {
					data[0] = new resourceResponse(200,resourceIds[0],true);
				}
			
			} else if (resource == "/reviews") {
				if (method == "POST") {
					if (userId == 0) {
						data[0] = new resourceResponse(403,null,false);
					} else {
						
							var pratilipi = resources[0];
							var author = yield getAuthorByPratilipiId(pratilipi);
							if (author!= null) {
								if (author.USER_ID != userId) {
									data[0] = new resourceResponse(200,null,true);
								} else {
									data[0] = new resourceResponse(403,null,false);
								}
							} else {
								data[0] = new resourceResponse(403,null,false);
							}
					}
				} else if (method == "GET"){
					data[0] = new resourceResponse(200, resourceIds[0], true);
				} else {
					var review = resources.data[0];
					if (review.user!= null && review.user.id == userId) {
						data[0] = new resourceResponse(200,review.id,true);
					} else {
						data[0] = new resourceResponse(403,review.id,false);
					}
				}
			} else if (resource == "/comments") {
				if (method == "POST") {
					if (userId == 0) {
						data[0] = new resourceResponse(403,null,false);
					} else {
						data[0] = new resourceResponse(200,null,true);
					}
				} else if (method == "GET"){
					data[0] = new resourceResponse(200, resourceIds[0], true);
				} else {
					var comment = resources.data[0];
					if (comment.user!= null && comment.user.id == userId) {
						data[0] = new resourceResponse(200,comment.id,true);
					} else {
						data[0] = new resourceResponse(403,comment.id,false);
					}
				}
			} else if (resource == "/votes") {
				if (method == "POST") {
					if (userId == 0) {
						data[0] = new resourceResponse(403,null,false);
					} else {
						data[0] = new resourceResponse(200,null,true);
					}
				} else {
					data[0] = new resourceResponse(200,0,true);
				}
			} else if (resource == "/recommendation/pratilipis" || resource == "/search/search" || resource == "/search/trending_search") {
				data[0] = new resourceResponse(200,0,true);
			} else if (resource == "/blog-scraper") {
				var isAEES = AEES.isAEE(userId);
				if (isAEES) {
					data[0] = new resourceResponse(200,null,true);
				} else {
					data[0] = new resourceResponse(403,null,false);	
				}
			} else if (resource == "/events") {
				var eventId = null;
				if (method != "POST") {
					eventId = resourceIds[0];
				}
				
				if (method == "POST" || method == "PATCH") {
					var isAEES = AEES.isAEE(userId);
					if (isAEES) {
						data[0] = new resourceResponse(200,eventId,true);
					} else {
						data[0] = new resourceResponse(403,eventId,false);	
					}
				} else if (method == "GET"){
					data[0] = new resourceResponse(200,eventId,true);
				} else {
					data[0] = new resourceResponse(403,eventId,false);
				}
			} else if (resource == "/devices") {
				if (userId == 0 || userId == null) {
					data[0] = new resourceResponse(403,null,false);
				} else {
					data[0] = new resourceResponse(200,null,true);
				}
			} else if (resource == "/library") {
				if (userId == 0 || userId == null) {
					data[0] = new resourceResponse(403,null,false);
				} else {
					data[0] = new resourceResponse(200,null,true);
				}
			} else {
				data[0] = new resourceResponse(403,null,false);
			}
			
		});
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


function getAuthorByPratilipiId(pratilipi) {
	return new Promise( function (resolve,reject) {
		return AuthorService.getAuthor(pratilipi.AUTHOR_ID)
	    .then ((author) => {
	        if (author!=null) {
	        	resolve(author);
	        } else {
	        	resolve(null);
	        }
	    }).catch( (err) => {
	    	console.log("Error while fetching authors");
	        console.log(err);
	        reject();  
	        
	    });
	});
}


function addToCache(key, value) {
	return new Promise (function (resolve,reject) {
	 	cacheUtility.insert( key, value )
	 	.then(function(){
	 		console.log("Successfully added to cache!!!");
	 		resolve();
	 	})
	 	.catch ((err) => {
	 		console.log("Error while adding to cache");
	        console.log(err);
	        reject();  
	 	});
	});
}

function getFromCache (key) {
	return new Promise (function (resolve,reject) {
	 	cacheUtility.get( key )
	 	.then( (data) => {
	 		return data;
	 		//resolve();
	 	})
	 	.catch ((err) => {
	 		console.log("Error while getting from cache");
	        console.log(err);
	        reject();  
	 	});
	});
}

function deleteFromCache (key) {
	return new Promise (function (resolve,reject) {
	 	cacheUtility.delete( key )
	 	.then( function(){
	 		console.log("Successfully delete from cache!!!");
	 		resolve();
	 	})
	 	.catch ((err) => {
	 		console.log("Error while deleting from cache");
	        console.log(err);
	        reject();  
	 	});
	});
}

function getFromDB(accessToken, res) {
	return userService
 	.getUserId( accessToken )
 	.then( ( id ) => {
 		console.log("Reading user-id from user service ");
 		
 		// add to cache
 		var user = new User(id);
 		cacheUtility.insert( accessToken, user );
 		res.setHeader('User-Id', id);
 		return id;
 	})
 	.catch( ( err ) => {
 		console.log(err);
 		return 0;
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
