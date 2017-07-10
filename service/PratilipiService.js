module.exports = Pratilipi;

var dbUtility = require( '../lib/DbUtility.js' );
var PratilipiSchema = {
	structure : {
		'ID'		: { 'type' : 'INTEGER', 'default' : 0 },
		'LANGUAGE'	: { 'type' : 'STRING', 'default' : null },
		'AUTHOR_ID'	: { 'type' : 'INTEGER', 'default' : 0 }
	},primaryKey  : 'ID'
};

function Pratilipi ( config ) {
	// initialize db utility
	dbUtility = dbUtility( { projectId: config.projectId, kind: 'PRATILIPI', 'schema' : PratilipiSchema} );
	return {
		getPratilipis: function getPratilipis (pratilipiIds) {
			return dbUtility.list(pratilipiIds)
			.then ((data) => {
				return data;
			});
			throw 'ENTITY NOT FOUND';
		},
		getPratilipi: function getPratilipi (pratilipiId) {
			return dbUtility.get(pratilipiId)
			.then ((data) => {
				return data;
			});
			throw 'ENTITY NOT FOUND';
		}
	};
}
