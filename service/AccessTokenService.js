module.exports = AccessToken;

var dbUtility = require( '../lib/DbUtility.js' );
var AccessTokenSchema = {
	structure : {
		'ID'		: { 'type' : 'STRING', 'default' : 0},
		'USER_ID'	: {'type': 'INTEGER', 'default': 0}
	},primaryKey : 'ID'
};

function AccessToken ( config ) {
	// initialize db utility
	dbUtility = dbUtility( { projectId: config.projectId, kind: 'ACCESS_TOKEN', 'schema' : AccessTokenSchema} );
	return {
		getUserId: function getUserId (accessToken) {
			return dbUtility.get(accessToken)
			.then ((data) => {
				if (data) {
					return data.USER_ID;
				}
				throw 'ACCESS_TOKEN ENTITY NOT FOUND';
			});
		} 
	};
}
