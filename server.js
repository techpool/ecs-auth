
// Modules
var express = require('express');

// Load Configurations
var config = require( './config/main' )[ process.env.STAGE ];

//Initialize app
const app = express();
app.set('port', config.PORT);

// Load Services
var accessTokenService = require( './service/AccessTokenService' )( { projectId: process.env.GCP_PROJ_ID } );
var pratilipiService = require('./service/PratilipiService')( { projectId: process.env.GCP_PROJ_ID } );
var authorService = require('./service/AuthorService')( { projectId: process.env.GCP_PROJ_ID } );

// Initialize utilities
const Logging = require( './lib/LoggingGcp.js' ).init({
  projectId: process.env.GCP_PROJ_ID,
  service: config.SERVICE
});

const Metric = require( './lib/MetricGcp.js' ).init({
	projectId: process.env.GCP_PROJ_ID,
	service: config.SERVICE
});

const cacheUtility = require('./lib/CacheUtility.js')({
	port : config.REDIS_HOST_PORT,
	hostIp : config.REDIS_HOST_IP,
	resource : config.REDIS_KIND,
	db : 3
});


const latencyMetric = new Metric( 'int64', 'Latency' );

var accessTokenUserIdHash = {};

function User(id) {
    this.id = id;
}

function isAllowed(id,isAllowed) {
    this._id = id;
    this._isAllowed = isAllowed;
};

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


app.get("/auth/authorize", function (req, res) {
	req.accessToken = req.headers.accesstoken;
	var promise =  cacheUtility.get(req.accessToken)
	.catch((error) => {
	    var error = 'Redis Get id Error';
	    console.log(error);
	    req.log.submit(500,error.length);
	  })
	.then((user) => {
		if( user !== null ) {
			console.log('Got user-id from redis');
        	//req.log.info("The user-id is "+user.id);
			res.header('User-Id' , user.id );
			res.status(204).send();
			var data = "req is authorized";
			req.log.info(data);
			req.log.submit( 204, data.length );
			latencyMetric.write( Date.now() - req.startTimestamp );
		} else {
			accessTokenService
	     	.getUserId( req.accessToken )
	     	.then( ( userId ) => {
	     		req.log.info("Reading user-id from gcp : "+userId);
	     		console.log("Reading user-id from gcp : "+userId);
	     		res.header('User-Id' , userId );
	     		var user = new User(userId);
	     		cacheUtility.insert( req.accessToken, user )
	             .catch((error) => {
	            	 console.log('Redis get ids Error');
	            	 var error = 'Redis Insert ids Error';
	            	 req.log.error(error);
	            	 req.log.submit( 500, error.length );
	              });
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
		}
	});
});



// Initialize server
var server = app.listen(app.get('port'), function () {
   var host = server.address().address
   var port = server.address().port
})
