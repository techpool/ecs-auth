
// Modules
var express = require('express');
//var bodyParser = require('body-parser');

// Load Configurations
var config = require( './config/main' )[ process.env.STAGE || 'local'];

//Initialize app
const app = express();
app.set('port', config.PORT);

// Load Services
const AccessTokenService = require( './service/AccessTokenService' )( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const PratilipiService = require('./service/PratilipiService')( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );
const AuthorService = require('./service/AuthorService')( { projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID} );

// Initialize utilities
const Logging = require( './lib/LoggingGcp.js' ).init({
  projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID,
  service: config.SERVICE
});

const Metric = require( './lib/MetricGcp.js' ).init({
	projectId: process.env.GCP_PROJ_ID || config.GCP_PROJ_ID,
	service: config.SERVICE
});

const UserAccessList = require('./config/UserAccessUtil.js');
const Language = require("./config/Language.js").Language;
const AccessType = require("./config/AccessType.js").AccessType;

var Role = UserAccessList.Role;
var AEES = UserAccessList.AEES;
AEES = new AEES();

const latencyMetric = new Metric( 'int64', 'Latency' );


//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json())

var accessTokenUserIdHash = {};

//for initializing log object
app.use((request, response, next) => {
  var log = request.log = new Logging( request );
  request.startTimestamp = Date.now();
  next();
});


//Request Handlers
app.get("/health", function (req, res) {
	console.log("Request reached health");
	var message = {"message":"Auth service is running healthy."};
	res.status("200").send(message);
});


function User(id) {
    this.id = id;
}

function pratilipisResponse(list) {
    this.pratilipis = list;
};

function access(id,hasAccessToUpdate) {
	this.id = id;
	this.hasAccessToUpdate = hasAccessToUpdate;
}

// This API is depricated, will no longer be available after Jul 15
app.get("/auth/authorize", function (req, res) {
	req.accessToken = req.headers.accesstoken;
	console.log("Fetching user-id for accesstoken : "+req.accessToken);
	AccessTokenService
 	.getUserId( req.accessToken )
 	.then( ( userId ) => {
 		req.log.info("Reading user-id from gcp : "+userId);
 		console.log("Reading user-id from gcp : "+userId);
 		res.header('User-Id' , userId );
 		res.status(204).send();
 		var data = "req is authorized";
		req.log.info(data);
		req.log.submit( 204, data.length );
		latencyMetric.write( Date.now() - req.startTimestamp );
 	})
 	.catch( ( err ) => {
 		var data = 'You are not authorized!';
 		console.log(err);
 		res.status( 403 ).send( data );
 		req.log.error( JSON.stringify( err ) );
 		req.log.submit( 403, data.length );
 	});
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

app.get("/auth/isAuthorized", function (req, res) {
	
	// Read Headers
	var accessToken = req.headers['access-token'];
	var userId = req.headers['user-id'];
	if (accessToken == null && userId == null) {
		res.status( 400 ).send( "Bad request" );
		return;
	}
	
	// Read query parameters
	var resource = unescape(req.query.resource);
	var method = req.query.method;
	var resourceIds = req.query.id;
	if (resourceIds == null) {
		res.status( 400 ).send( "Bad request" );
		return;
	} else {
		resourceIds = resourceIds.split(',').map(Number);
	}
	
	// Get User-Id for accessToken
	var userIdPromise;
	if (userId == null) {
		userIdPromise = AccessTokenService
	 	.getUserId( accessToken )
	 	.then( ( id ) => {
	 		console.log("Reading user-id from gcp : "+id);
	 		userId = id;
	 		return;
	 	})
	 	.catch( ( err ) => {
	 		var data = 'You are not authorized!';
	 		console.log(err);
	 		return;
	 	});
	} else {
		userIdPromise = new Promise((resolve,reject)=>{
			resolve();
		});
	}

	// Get resources by ids
	var resources;
	var resourcePromise = userIdPromise.then (function () {
		if (resource == "/pratilipis") {
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
		} else {
			resourcePromise = null;
		}
		
	});

	
	// Find if user is authorized
	var data = [];
	var dataPromise = resourcePromise.then (function () {
		var roles = AEES.getRoles(userId);
		var langugeAdmin;
		var fetchPromises = [];
		var pratilipiId;
		for (i=0;i<resources.length;i++) {
			if (resource == "/pratilipis") {
				pratilipi = resources[i];
				if (pratilipi != null) {
					console.log("verifying authorization for  "+pratilipi.ID);
					langugeAdmin = Role["ADMIN_"+pratilipi.LANGUAGE];
					if (roles.includes(Role.ADMINISTRATOR)) {
						data[i] = new resourceResponse(200,pratilipi.ID,true);
					} else if (roles.includes(Role.ADMIN)) {
						// to handle admin
					} else if (roles.includes(langugeAdmin)) {
						data[i] = new resourceResponse(200,pratilipi.ID,true);
					} else if (roles.includes(Role.MEMBER)) {
						
						var accessType = null;
						if (method == "GET") {
							accessType = AccessType.PRATILIPI_READ_CONTENT;
						} else if (method == "PUT" || method == "PATCH" ) {
							accessType = AccessType.PRATILIPI_UPDATE;
						} else if (method == "POST" ) {
							accessType = AccessType.PRATILIPI_ADD;
						}
						
						var language = null;
						if (accessType != AccessType.PRATILIPI_ADD) {
							language = pratilipi.LANGUAGE;
						}
						
						var hasAccess = AEES.hasUserAccess(userId,language,accessType);
						if (hasAccess) {
							fetchPromises.push(isUserAuthorToPratilipi(i,data,userId,pratilipi));
						} else {
							data[i] = new resourceResponse(403,pratilipi.ID,false);
						}
						
					} else if (roles.includes(Role.GUEST)) {
						if (method == "GET") {
							data[i] = new resourceResponse(200,pratilipi.ID,true)
						} else {
							data[i] = new resourceResponse(403,pratilipi.ID,false);
						}
					}
				} else {
					data[i] = new resourceResponse(404,resourceIds[i],false);
				}
			}
		}
		return new Promise((resolve,reject)=>{
			Promise.all(fetchPromises).then (function () {
				resolve();
			});
		});
	});
	
	// Generate and send the response
	dataPromise.then (function (){
		console.log("sending response");
		res.setHeader('content-type', 'application/json');
		res.setHeader('User-Id', userId);
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
})
