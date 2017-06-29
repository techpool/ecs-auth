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
		getPratilipis: function getPratilipis (pratilipiIds) {
			return dbUtility.list(pratilipiIds)
			.then ((data) => {
				if (data) {
					return data;
				}
				throw 'ENTITY NOT FOUND';
			});
		}
	};
}
