
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

const redisUtility = require( './lib/RedisUtility.js' ) ( {
  port : config.REDIS_HOST_PORT,
  hostIp : config.REDIS_HOST_IP,
  resourceType : config.REDIS_KIND,
  db : 3
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
	var promise =  redisUtility.getResourceFromRedis(request.accessToken)
	.catch((error) => {
	    var error = 'Redis Get id Error';
	    request.log.submit(500,error.length);
	  })
	.then((value) => {
		if( value !== null ) {
        		request.log.info("The user-id is "+value);
				response.header('User-Id' , value );
				next();
		} else {
			 accessTokenService
	     	.getUserId( request.accessToken )
	     	.then( ( userId ) => {
	     		request.log.info("Reading user-id from gcp : "+userId);
	     		response.header('User-Id' , userId );
	    		redisUtility.insertResourceInRedis( request.accessToken, userId )
	             .catch((error) => {
	            	  var error = 'Redis Insert ids Error';
	            	 request.log.submit( 500, error.length );
	              });
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

});


//Request Handlers
app.get("/auth/*", function (req, res) {
	var log = req.log;
	var data = "Request is authorized";
	res.status(204).send();
	log.info(data);
	log.submit( 204, data.length );
	latencyMetric.write( Date.now() - request.startTimestamp );
});


// Initialize server
var server = app.listen(app.get('port'), function () {
   var host = server.address().address
   var port = server.address().port
})
