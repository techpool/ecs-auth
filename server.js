
// Modules
var express = require('express');

// Load Configurations
var config = require( './config/main' )[ process.env.STAGE ];

//Initialize app
const app = express();
app.set('port', config.PORT);

// Load Services
var accessTokenService = require( './AccessTokenService' )( { projectId: process.env.GCP_PROJ_ID } );

// Initialize utilities
const Logging = require( './lib/LoggingGcp.js' ).init({
  projectId: process.env.GCP_PROJ_ID,
  service: config.SERVICE
});

const Metric = require( './lib/MetricGcp.js' ).init({
	projectId: process.env.GCP_PROJ_ID,
	service: config.SERVICE
});


const latencyMetric = new Metric( 'int64', 'Latency' );

var accessTokenUserIdHash = {};

//for initializing log object
app.use((request, response, next) => {
  var log = request.log = new Logging( request );
  request.startTimestamp = Date.now();
  next();
});


//Request Handlers
app.get("/health", function (req, res) {
	var message = {"message":"Auth service is running healthy."};
	res.status("200").send(message);
});


/**
 * Middleware to authorize every request
 * before reaching the handlers
 */ 
app.use( ( request,response, next ) => {
	request.accessToken = request.headers.accesstoken;
	//log.info( 'accessToken ' + request.accessToken );
	var existingUserId = accessTokenUserIdHash[ request.accessToken ];
	if( existingUserId ) {
		var data = "Reading user-id from hash";
		response.header('User-Id' , existingUserId );
		request.log.info(data);
		request.log.submit( 204, data.length );
		next();
	 } else {
		 accessTokenService
     	.getUserId( request.accessToken )
     	.then( ( userId ) => {
     		var data = "Reading user-id from gcp";
     		response.header('User-Id' , userId );
     		accessTokenUserIdHash[ request.accessToken ] = userId;
     		request.log.info(data);
    		request.log.submit( 204, data.length );
     		next();
     	})
     	.catch( ( err ) => {
     		var data = 'You are not authorized!';
     		response.status( 403 ).send( data );
     		request.log.error( JSON.stringify( err ) );
     		request.log.submit( 403, data.length );
     		latencyMetric.write( Date.now() - request.startTimestamp );
     	});
	}
});


//Request Handlers
app.get("/auth/*", function (req, res) {
	var log = req.log;
	var data = "Request is authorized";
	res.status(204).send();
	log.info(data);
	log.submit( 204, data.length );
});


// Initialize server
var server = app.listen(app.get('port'), function () {
   var host = server.address().address
   var port = server.address().port
   
   //log.info("App listening at http://%s:%s", host, port)
})
