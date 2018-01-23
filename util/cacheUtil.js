var logger = require( '../lib/logger.js' );

var config = require( './../config/main' )[ process.env.STAGE || 'local'];
const cacheUtility = require('./../lib/CacheUtility.js')({
 	port : config.REDIS_HOST_PORT,
 	hostIp : config.REDIS_HOST_IP,
 	resource : config.REDIS_KIND,
	db : 3
});


function add(key, value) {
	return new Promise (function (resolve,reject) {
	 	cacheUtility.insert( key, value )
	 	.then(function(){
	 		logger.info("Successfully added to cache!!!");
	 		resolve();
	 	})
	 	.catch ((err) => {
	 		logger.error("Error while adding to cache");
	 		logger.error(err);
	        reject();  
	 	});
	});
}

function get (key) {
	return new Promise (function (resolve,reject) {
	 	cacheUtility.get( key )
	 	.then( (data) => {
	 		//return data;
	 		resolve(data);
	 	})
	 	.catch ((err) => {
	 		logger.error("Error while getting from cache");
	 		logger.error(err);
	        reject();  
	 	});
	});
}

function del (key) {
	return new Promise (function (resolve,reject) {
	 	cacheUtility.delete( key )
	 	.then( function(){
	 		logger.info("Successfully delete from cache!!!");
	 		resolve();
	 	})
	 	.catch ((err) => {
	 		logger.error("Error while deleting from cache");
	 		logger.error(err);
	        reject();  
	 	});
	});
}


module.exports = {
		add,
		get,
		del
}


