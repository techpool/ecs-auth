module.exports = AccessToken;

var dbUtility = require( '../lib/DbUtility.js' );
var AccessTokenSchema = {
	structure : {
		'ID': { 'type' : 'STRING', 'default' : 0},
		'USER_ID': {'type': 'INTEGER', 'default': 0}
	},primaryKey  : 'ID'
};

function AccessToken ( config ) {
	// initialize db utility
	dbUtility = dbUtility( { projectId: config.projectId, kind: 'ACCESS_TOKEN', 'schema' : AccessTokenSchema} );
	return {
		getUserId: function getUserId (accessToken) {
			return dbUtility.list([accessToken])
			.then ((data) => {
				if (data) {
					return data[0].USER_ID;
				}
				throw 'ENTITY NOT FOUND';
			});
		} 
	};
}
