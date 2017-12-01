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

function get (key) {
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

function del (key) {
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


module.exports = {
		add,
		get,
		del
}


