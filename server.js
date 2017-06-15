
// Modules
var express = require('express');

// Load Configurations
var config = require( './config/main' )[ process.env.STAGE ];

//Initialize app
const app = express();
app.set('port', config.API_ORCHESTRATOR_PORT);

// Load Services
var accessTokenService = require( './AccessTokenService' )( { projectId: config.ACCESS_TOKEN_DATASTORE_PROJECT } );

// Initialize utilities
const Logging = require( './lib/LoggingGcp.js' ).init({
  projectId: config.LOGGING_PROJECT,
  service: 'api-orchestrator'
});

const Metric = require( './lib/MetricGcp.js' ).init({
  projectId: config.METRIC_PROJECT,
  service: 'api-orchestrator'
});


const latencyMetric = new Metric( 'int64', 'Latency' );

var accessTokenUserIdHash = {};

/**
 * Middleware to authorize every request
 * before reaching the handlers
 */ 
app.use( ( request,response, next ) => {
	
	var log = request.log = new Logging( request );
	// white listed urls to go pass freely
	if (request.url == "/health") {
		next();
	} else {
		request.startTimestamp = Date.now();
		request.accessToken = request.headers.accesstoken;
		log.info( 'accessToken ' + request.accessToken );
		var existingUserId = accessTokenUserIdHash[ request.accessToken ];
		log.info( 'uid ' + existingUserId );
		
		if( existingUserId ) {
			response.header('User-Id' , userId );
			next();
		 } else {
			 log.info( 'accessToken ' + request.accessToken );
			 accessTokenService
	     	.getUserId( request.accessToken )
	     	.then( ( userId ) => {
	     		response.header('User-Id' , userId );
	     		accessTokenUserIdHash[ request.accessToken ] = userId;
	     		next();
	     	})
	     	.catch( ( err ) => {
	     		var data = 'You are not authorized!';
	     		response.status( 403 ).send( data );
	     		log.error( JSON.stringify( err ) );
	     		log.submit( 403, data.length );
	     		latencyMetric.write( Date.now() - request.startTimestamp );
	     	});
		}
	}
});


//Request Handlers
app.get("/health", function (req, res) {
	var message = {"message":"Auth service is running healthy."};
	res.status("200").send(message);
});

app.get("/authorize", function (req, res) {
	res.status(204).send();
});


// Initialize server
var server = app.listen(app.get('port'), function () {
   var host = server.address().address
   var port = server.address().port
   
   log.info("App listening at http://%s:%s", host, port)
})