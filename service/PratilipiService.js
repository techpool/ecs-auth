module.exports = Pratilipi;

var dbUtility = require( '../lib/DbUtility.js' );
var PratilipiSchema = {
	structure : {
		'ID': { 'type' : 'STRING', 'default' : 0},
		'AUTHOR_ID': { 'type' : 'INTEGER', 'default' : 0}
	},primaryKey  : 'ID'
};

function Pratilipi ( config ) {
	// initialize db utility
	dbUtility = dbUtility( { projectId: config.projectId, kind: 'PRATILIPI', 'schema' : PratilipiSchema} );
	return {
		getAuthorId: function getAuthorId (pratilipiId) {
			return dbUtility.list([pratilipiId])
			.then ((data) => {
				if (data) {
					return data[0].AUTHOR_ID;
				}
				throw 'ENTITY NOT FOUND';
			});
		} 
	};
}