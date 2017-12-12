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
const UserService        = require('./service/UserService');
const PratilipiService   = require('./service/PratilipiService');
const AuthorService      = require('./service/AuthorService')
const ReviewService      = require('./service/ReviewService');
const CommentService     = require('./service/CommentService');
const UserAccessList     = require('./config/UserAccessUtil.js');
const AccessType         = require('./config/AccessType.js').AccessType;

//const cacheUtility = require('./lib/CacheUtility.js')({
// 	port : config.REDIS_HOST_PORT,
// 	hostIp : config.REDIS_HOST_IP,
// 	resource : config.REDIS_KIND,
//	db : 3
//});

const cacheUtility = require('./util/cacheUtil');


var validResources = ['/pratilipis','/authors','/recommendation/pratilipis','/search/search',
	'/search/trending_search','/follows','/userauthor/follow/list', '/userauthor/follow',
	'/reviews','/userpratilipi','/userpratilipi/review','/userpratilipi/review/list','/userpratilipi/reviews',
	'/comments','/comment','/comment/list',
	'/vote','/votes', '/blog-scraper',
	'/event','/event/list','/events','/event/pratilipi','/devices', '/notifications',
        '/userpratilipi/library','/userpratilipi/library/list','/library', '/social-connect',
        '/user/register','/user/login','/user/login/facebook','/user/login/google','/user/verification',
        '/user/email','/user/passwordupdate','/user','/user/logout','/authors/recommendation',
	'/pratilipi/content/batch','/pratilipi/content/chapter/add','/pratilipi/content/chapter/delete',
	'/pratilipi/content/index','/pratilipi/content','/coverimage-recommendation',
	'/report','/init',
	'/admins/users/*','/admins/users'];
var validMethods   = ['POST','GET','PUT','PATCH','DELETE'];

var AEES = UserAccessList.AEES;
AEES = new AEES();
var reviewService = new ReviewService(process.env.STAGE || 'local');
var commentService = new CommentService(process.env.STAGE || 'local');
var userService    = new UserService(process.env.STAGE || 'local');
var authorService  = new AuthorService(process.env.STAGE || 'local');
var pratilipiService = new PratilipiService(process.env.STAGE || 'local');

//Request Handlers
// API to check health
app.get("/health", function (req, res) {
	var message = {"message":"Auth service is running healthy."};
	res.status("200").send(message);
});

app.use(logger('short'));

// for initializing log object
app.use((request, response, next) => {
  request.log = [];
  next();
});


//apis to resources mapping
app.use((request, response, next) => {
	var urlParts = url.parse(request.url, true);
    var pathname = urlParts.pathname;
    var isPathMapped = false;
    var validationType = null;
    if (pathname === "/auth/isAuthorized") {
    	var resource = unescape(request.query.resource);
		if (resource.startsWith("/blog-scraper")) {
			resource = resource.replace(/\/[a-f\d]{24}/g, "/*");
		} else {
			resource = resource.replace(/\/[0-9]+/g, "/*");
		}
		
		if (resource == "/image/pratilipi/cover" || resource == "/image/pratilipi/*/cover" 
			|| resource == "/pratilipis/*" || resource == "/image/pratilipi/content"
		        || resource == '/pratilipi/content/batch' || resource == '/pratilipi/content/chapter/add'
			|| resource == '/pratilipi/content/chapter/delete' || resource == '/pratilipi/content/index'
			|| resource == '/pratilipi/content') {
			resource = "/pratilipis";
			isPathMapped = true;
		} else if (resource == "/image/author/cover" || resource == "/image/author/*/cover"
			|| resource == "/image/author/profile" || resource == "/image/author/*/profile"
				|| resource == "/authors/*") {
			resource = "/authors";
			isPathMapped = true;
		} else if (resource == "/userauthor/follow/list" || resource == "/userauthor/follow") {
			resource = "/follows";
		} else if (resource == "/userpratilipi/library/list" || resource == "/userpratilipi/library" || resource.startsWith("/library")) {
			resource = "/library";
		} else if ( resource == "/report/v1.0/report" ) {
			resource = "/report";
		} else if (resource == "/notification/list" || resource == "/notification" || resource == "/notification/batch" ) {
			resource = "/notifications";
		} else if (resource == "/init/v1.0/list" || resource == "/init/v1.0/init" ) {
			resource = "/init";
		} else if (resource == "/userpratilipi" || resource == "/userpratilipi/review" || resource == "/userpratilipi/review/list") {
			resource = "/userpratilipi/reviews";
		} else if (resource == "/comment" || resource == "/comment/list") {
			resource = "/comment";
			if (request.query.method == 'POST' && request.query.commentId != undefined) {
				isPathMapped = true;
			}
		} else if (resource == "/blog-scraper"
		  || resource == "/blog-scraper/*"
		  || resource == "/blog-scraper/*/create"
		  || resource == "/blog-scraper/*/publish"
		  || resource == "/blog-scraper/*/scrape"
		  || resource == "/blog-scraper/search") {
			resource = "/blog-scraper";
		} else if (resource == "/event" || resource == "/event/list" || resource == "/event/pratilipi" || resource == "/image/event/banner") {
			resource = "/events";
		} else if (resource == '/social-connect/access_token' 
		|| resource == '/social-connect/contacts' 
		|| resource == '/social-connect/access_token/unlink' 
		|| resource == '/social-connect/access_token/remind_me_later' 
		|| resource == '/social-connect/contacts/invite') {
			resource = '/social-connect'	
		} else if (resource == '/user/register' || resource == '/user/login' 
			|| resource == '/user/login/facebook' || resource == '/user/login/google') {
			resource = '/user'
			request.query.validationType = "PRELOGIN"
		} else if (resource == '/user/email' || resource == '/user/passwordupdate' || resource == '/user/verification') {
			resource = '/user'
			request.query.validationType = "NONE";
		} else if (resource == '/user' || resource == '/user/logout') {
			resource = '/user'
			request.query.validationType = "POSTLOGIN";
			if (request.query.userId != undefined && request.query.userId != 0) {
				isPathMapped = true;
			}
		} else if (resource == '/coverimage-recommendation/cover/select' || resource == '/coverimage-recommendation/cover') {
			resource = '/coverimage-recommendation';
		} else if (resource == '/admins/users/*') {
			resource = "/admins/users"
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

//API to delete accessToken - userId from cache
app.delete("/auth/accessToken", function(req, res){
	req.log.push("Request to delete access token from cache");
	
	// read headers
	var accessToken = req.headers['access-token'];
	req.log.push(`access-token=${accessToken}`);
	res.setHeader('content-type', 'application/json');
	
	if (accessToken != null) {
	 		cacheUtility.del( accessToken, req )
	 		.then(function(){
	 			req.log.push("successfully deleted access token from cache ");
	 			res.status(200).send(JSON.stringify({"message":"Successfully deleted"}));
	 			req.log.push({"message":"Successfully deleted"});
				console.log(JSON.stringify({"log":req.log}));
	 		})
	 		.catch((err) => {
	 			req.log.push("Error while deleting access token from cache " + JSON.stringify(err,null,4));
	 			res.status(500).send(JSON.stringify(new errorResponse('Some exception occured at the server.')));
	 			req.log.push({"message":"Some exception occured at the server."});
				console.log(JSON.stringify({"log":req.log}));
	 		});
	 		
	} else {
		res.status(400).send( JSON.stringify(new errorResponse("Invalid parameters")));
		req.log.push({"message":"Invalid parameters."});
		console.log(JSON.stringify({"log":req.log}));
	}
});

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
	var validationType = req.query.validationType;
	
	if (resource == '/userpratilipi/reviews') {
		resourceIds = req.query.pratilipiId;
	} else if (resource == '/reviews') {
		if (method == 'POST') {
			resourceIds = req.query.parentId;
		}
	} else if (resource == "/comment") {
		if (method == 'PATCH') {
			resourceIds = req.query.commentId;
		} else if (method == 'GET') {
			resourceIds = req.query.parentId;
		}
	} else if (resource == "/comments") { 
		if (method == 'POST') {
			resourceIds = req.query.parentId;
		}
	} else if (resource == '/votes' || resource == "/vote") {
		resourceIds = req.query.parentId;
	} else if (resource == '/user') {
		if (method == "PATCH" || (method == "GET" && req.query.userId != null)) {
			resourceIds = req.query.userId;
		}
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
	   	|| ( resource == "/library" )
	   	|| ( resource == '/social-connect' )
	   	|| ( resource == '/user' && method == "GET" && resourceIds == null)
	   	|| resource == '/authors/recommendation'
	   	|| ( resource == '/notifications' && method == 'GET' && resourceIds == null )
	   	|| ( resource == '/init' && method == 'GET' && resourceIds == null ) 
	   	|| ( resource == '/report' && method == 'POST' && resourceIds == null )
	   	|| ( (resource == '/authors' || resource == '/pratilipis') && method == 'GET' && resourceIds == null ) 
	   	|| resource == '/coverimage-recommendation') {
		resourceIds = "0";
		resources = [];
	}
	
	// Validate query parameters
	if (!validResources.includes(resource) 
		|| !validMethods.includes(method)  
		|| (method != 'POST' && resourceIds == null) 
		|| ((resource == "/pratilipis" || resource == "/authors") && method == 'POST' && language == null)) {
		res.setHeader('content-type', 'application/json');
		res.status(400).send( JSON.stringify(new errorResponse("Invalid parameters")));
		req.log.push({"message":"Invalid parameters"});
		console.log(JSON.stringify({"log":req.log}));
		return;
	}
	
	if (method != 'POST' 
		|| (resource == "/pratilipis" && resourceType == "AUTHOR") 
		|| (resource == "/follows")
		|| ((resource == "/userpratilipi/reviews" || resource == "/reviews") && method == "POST")){
		if( resourceIds == undefined ) {
			res.setHeader('content-type', 'application/json');
			res.status( 400 ).send( JSON.stringify( new errorResponse( "Invalid parameters" ) ) );
			req.log.push({"message":"Invalid parameters"});
			console.log(JSON.stringify({"log":req.log}));
			return;
		}
		resourceIds = resourceIds.split(',').map(Number);
	}

	// Get User-Id for accessToken
	// TODO: remove accepting user-id from internal services. accept only accesstoken
	var userIdPromise;
	if ((userId == undefined || userId == null) && accessToken != null) {
		userIdPromise = cacheUtility.get(accessToken)
		.then((user) => {
			if( user !== null ) {
	 			userId = user.id;
	 			req.log.push('Got user-id from cache ' + userId);
	 			res.setHeader('User-Id', userId);
	 			return userId;
	 		} else {
 				return getFromDB(accessToken,res, req);
	 		}
		})
		.catch( (err) => {
			req.log.push('error while fetching user-id from cache');
			return getFromDB(accessToken, res, req);
		}).then((id) => {
			userId = id;
		});
	} else {
		// TODO: Check if given User-Id is valid
		userIdPromise = new Promise((resolve,reject)=>{
			if (userId == null) {
				res.setHeader('content-type', 'application/json');
				res.status(400).send( JSON.stringify(new errorResponse("Access-Token or User-Id are required in request header")));
				req.log.push({"message":"Access-Token or User-Id are required in request header"});
				console.log(JSON.stringify({"log":req.log}));
				return;
			} else {
				resolve();
			}
			
		});
	}
	
	// Get resources by ids
	var resources;
	var resourcePromise = userIdPromise.then (function () {
		
		req.log.push("Fetching resources for ",resourceIds,resourceType);
		
		if (resourceIds != 0 && (resource == "/pratilipis" && method != "POST" && resourceType == null) || ((resource == "/reviews" || resource == "/userpratilipi/reviews") && method == "POST")) {
			return pratilipiService
			.getPratilipis(resourceIds,accessToken)
			.then ((pratilipis) => {
				resources = pratilipis;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting pratilipi!';
		 		req.log.push(err);
		 		return;
		 	});
		} else if (resourceIds != 0 && (resource == "/authors" && (method == "PATCH" || method == "DELETE")) || (resource == "/pratilipis" && resourceType == "AUTHOR")
				|| (resource == "/follows" && method == "POST" )) {
			return authorService
			.getAuthors(resourceIds)
			.then ((authors) => {
				resources = authors;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting authors!';
		 		req.log.push(err);
		 		return;
		 	});
		} else if (((resource == "/reviews" || resource == "/userpratilipi/reviews") && (method == "PATCH" || method == "DELETE"))) {
			return reviewService.getReviews(resourceIds, userId)
			.then((reviews) => {
				resources = reviews;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting reviews!';
		 		req.log.push(err);
		 		return;
		 	});
		} else if (((resource == "/comments" || resource == "/comment") && (method == "PATCH" || method == "DELETE"))) {
			return commentService.getComments(resourceIds, userId)
			.then((comments) => {
				resources = comments;
				return;
			})
			.catch( ( err ) => {
		 		var data = 'Error in getting comments!';
		 		req.log.push(err);
		 		return;
		 	});
		}
	});

	// Verify authorization
	var data = [];
	var authorizePromise = resourcePromise.then (function () {
		return co(function * () {
			req.log.push("Verifying the authorization for user on the resource",resource);
			// Get roles for the user
			var roles = AEES.getRoles(userId);
			
			if (resource == "/pratilipis") {
				if (resourceType == "AUTHOR") {
					if (resources != null && resources.length > 0) {
						var author = resources[0];
						if (method == "GET") {
							if (state == "PUBLISHED") {
								data[0] = new resourceResponse(200, author.authorId, true);
							}
							else if (state == "DRAFTED") {
								if ((author && userId == author.userId) || AEES.hasUserAccess(userId,author.language,AccessType.AUTHOR_PRATILIPIS_READ)) {
									data[0] = new resourceResponse(200, author.authorId, true);
								} else {
									data[0] = new resourceResponse(403, author.authorId, false);
								} 
							} else {
								data[0] = new resourceResponse(403, author.authorId, false);
							}
						} else {
							if (AEES.hasUserAccess(userId,author.language,AccessType.AUTHOR_PRATILIPIS_ADD) || AEES.hasUserAccess(userId,author.language,AccessType.PRATILIPI_ADD)) {
								data[0] = new resourceResponse(200, author.authorId, true);
							} else {
								data[0] = new resourceResponse(403, author.authorId, false);
							}
						}
						
					} else {
						data[0] = new resourceResponse(403, null, false);
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
								
								language = pratilipi.language;
								
								var hasAccess = AEES.hasUserAccess(userId,language,accessType);
								if (hasAccess) {
									if (!AEES.isAEE(userId) && (accessType == AccessType.PRATILIPI_UPDATE || accessType == AccessType.PRATILIPI_DELETE)) {
										ownerPromises.push(isUserAuthorToPratilipi(i,data,userId,pratilipi, req));
									} else {
										data[i] = new resourceResponse(200,pratilipi.pratilipiId,true)
									}
								} else {
									data[i] = new resourceResponse(403,pratilipi.pratilipiId,false);
								}
								
							} else {
								data[i] = new resourceResponse(404,resourceIds[i],false);
							}
						}
						
						if (resourceIds == 0) {
							data[0] = new resourceResponse(200,0,true);
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
				} else if (method == "GET") {
					for (i = 0; i <= resourceIds.length; i++) {
						if (resourceIds[i]) {
							data[i] = new resourceResponse(200,resourceIds[i],true);
						}
					}
					
					if (resourceIds == 0) {
						data[0] = new resourceResponse(200,0,true);
					}
				} else {
					for (i = 0; i < resources.length; i++) {
						var author = resources[i];
						if (author != null) {
							
							var accessType=null;
							if (method == "PUT" || method == "PATCH" ) {
								accessType = AccessType.AUTHOR_UPDATE;
							} else if (method == "DELETE") {
								accessType = AccessType.AUTHOR_DELETE;
							}
							
							language = author.LANGUAGE;
							
							var hasAccess = AEES.hasUserAccess(userId,language,accessType);
							if (hasAccess) {
								if (!AEES.isAEE(userId) && accessType == AccessType.AUTHOR_UPDATE) {
									if (author && userId == author.userId) {
							        	data[i] = new resourceResponse(200,author.authorId,true);
							        } else {
							        	data[i] = new resourceResponse(403,author.authorId,false);
							        }
								} else {
									data[i] = new resourceResponse(200,author.authorId,true);
								}
							} else {
								data[i] = new resourceResponse(403,author.authorId,false);
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
						if (author && userId == author.userId) {
				        	data[0] = new resourceResponse(403,author.authorId,false);
				        } else {
				        	data[0] = new resourceResponse(200,author.authorId,true);
				        }
					} else {
						data[0] = new resourceResponse(403, resourceIds[0], false);
					}
					
				} else {
					data[0] = new resourceResponse(200,resourceIds[0],true);
				}
			
			} else if (resource == "/reviews" || resource == "/userpratilipi/reviews") {
				if (method == "POST") {
					if (userId == 0) {
						data[0] = new resourceResponse(403,null,false);
					} else {
						var pratilipi = resources[0];
						var author = null;
						if(pratilipi != null) {
							author = yield getAuthorByPratilipiId(pratilipi, req)
						}
						if (author!= null) {
							if (author && userId != author.userId) {
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
					if (review.user!= null && (review.user.id == userId || AEES.isAEE(userId))) {
						data[0] = new resourceResponse(200,review.id,true);
					} else {
						data[0] = new resourceResponse(403,review.id,false);
					}
				}
			} else if (resource == "/comments" || resource == "/comment") {
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
			} else if (resource == "/votes" || resource == "/vote") {
				if (method == "POST") {
					if (userId == 0) {
						data[0] = new resourceResponse(403,null,false);
					} else {
						data[0] = new resourceResponse(200,null,true);
					}
				} else {
					data[0] = new resourceResponse(200,0,true);
				}
			} else if (resource == "/recommendation/pratilipis" || resource == "/search/search" || resource == "/search/trending_search" || resource == "/social-connect" || resource == "/authors/recommendation") {
				data[0] = new resourceResponse(200,0,true);
			} else if (resource == '/coverimage-recommendation'){
				var isAEES = AEES.isAEE(userId);
				if (!isAEES) {
					data[0] = new resourceResponse(200,null,true);
				} else {
					data[0] = new resourceResponse(403,null,false);	
				}
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
			} else if (resource == "/notifications") {
				if (userId == 0 || userId == null) {
					data[0] = new resourceResponse(403,null,false);
				} else {
					data[0] = new resourceResponse(200,null,true);
				}
			} else if (resource == "/report") {
				data[0] = new resourceResponse(200,null,true);
			} else if (resource == "/init") {
				data[0] = new resourceResponse(200,null,true);
			} else if (resource == "/library") {
				if (userId == 0 || userId == null) {
					data[0] = new resourceResponse(403,null,false);
				} else {
					data[0] = new resourceResponse(200,null,true);
				}
			} else if (resource == "/user") {
				//console.log(method,validationType,userId,req.query.userId);
				if (method == "POST") {
					
					if (validationType == "PRELOGIN" && userId != 0) {
						// It has to return 'new resourceResponse(403,null,false);' 
						// but sending true to support for v1.
						data[0] = new resourceResponse(200,null,true);
					} else if (validationType == "POSTLOGIN") {
						if (req.query.userId) {
							if (AEES.isAEE(userId) || userId == req.query.userId) {
								data[0] = new resourceResponse(200,req.query.userId,true);
							} else {
								data[0] = new resourceResponse(403,req.query.userId,false);	
							}
						} else {
							if (userId) {
								data[0] = new resourceResponse(200,userId,true);
							} else {
								data[0] = new resourceResponse(403,null,false);
							}
							
						}
						
					}  else {
						data[0] = new resourceResponse(200,null,true);
					}
				} else if (method == "GET") {
						if (resourceIds != null && resourceIds != 0) {
							var isAEES = AEES.isAEE(userId);
							if (isAEES) {
								data[0] = new resourceResponse(200,null,true);
							} else {
								data[0] = new resourceResponse(403,null,false);
							}
						} else {
							data[0] = new resourceResponse(200,null,true);
						}
						
				} else if (method == "PATCH") {
					if (req.query.userId) {
						if (AEES.isAEE(userId) || userId == req.query.userId) {
							data[0] = new resourceResponse(200,req.query.userId,true);
						} else {
							data[0] = new resourceResponse(403,req.query.userId,false);	
						}
					} else {
						if (userId) {
							data[0] = new resourceResponse(200,userId,true);
						} else {
							data[0] = new resourceResponse(403,null,false);
						}
						
					}
				}
			} else if (resource == "/admins/users") {
				if (method == "DELETE" && AEES.isAEE(userId)) {
					data[0] = new resourceResponse(200,userId,true);
				} else {
					data[0] = new resourceResponse(403,userId,false);
				}
			} else {
				data[0] = new resourceResponse(403,null,false);
			}
			
		});
	});
	authorizePromise.then (function (){
		req.log.push("sending response",accessToken,userId);
		res.setHeader('content-type', 'application/json');
		if (req.query.originalResource != null && req.query.originalResource != "") {
			resource = req.query.originalResource;
		} 
		if (req.query.originalMethod != null && req.query.originalMethod != "") {
			method = req.query.originalMethod;
		}
		res.status(200).send(JSON.stringify(new isAuthorizedResponse(resource,method,data)));
		req.log.push(new isAuthorizedResponse(resource,method,data));
		console.log(JSON.stringify({"log":req.log}));
	})
	.catch( function( error ) {
		console.log(error);
		console.log(req.log);
	});

});

function isUserAuthorToPratilipi(index,data,userId,pratilipi,req) {
	console.log('Checking if user author to pratilipi');
	return new Promise( function (resolve,reject) {
		authorService.getAuthor(pratilipi.author.authorId)
	    .then ((author) => {
	        if (author && author.userId == userId) {
	        	data[index] = new resourceResponse(200,pratilipi.pratilipiId,true);
	        } else {
	        	data[index] = new resourceResponse(403,pratilipi.pratilipiId,false);
	        }
	        resolve();
	    }).catch( (err) => {
	    	req.log.push("Error while fetching authors");
	        req.log.push(err);
	        reject();  
	    });
	});	
}


function getAuthorByPratilipiId(pratilipi,req) {
	return new Promise( function (resolve,reject) {
		try{
			return authorService.getAuthor(pratilipi.author.authorId)
			.then ((author) => {
			    if (author!=null) {
			    	resolve(author);
			    } else {
			    	resolve(null);
			    }
			}).catch( (err) => {
				req.log.push("Error while fetching authors");
			    req.log.push(err);
			    reject();  
			    
			});
		} catch( error ) {
			req.log.push("Error while fetching authors");
			req.log.push(error);
			reject();
		}
		
	});
}


function getFromDB(accessToken, res,req) {
	return userService
 	.getUserId( accessToken )
 	.then( ( id ) => {
 		req.log.push("Reading user-id from user service " + accessToken + " " + id);
 		
 		// add to cache
 		var user = new User(id);
 		cacheUtility.add( accessToken, user );
 		res.setHeader('User-Id', id);
 		return id;
 	})
 	.catch( ( err ) => {
 		req.log.push(err.message);
 		req.log.push(err.stack);
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
