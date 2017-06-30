module.exports = Author;

var dbUtility = require( '../lib/DbUtility.js' );
var AuthorSchema = {
	structure : {
		'ID': { 'type' : 'INTEGER', 'default' : 0},
		'USER_ID': { 'type' : 'INTEGER', 'default' : 0}
	},primaryKey  : 'ID'
};

function Author ( config ) {
	// initialize db utility
	dbUtility = dbUtility( { projectId: config.projectId, kind: 'AUTHOR', 'schema' : AuthorSchema} );
	return {
		getAuthors: function getAuthors (authorIds) {
			return dbUtility.list(authorIds)
			.then ((data) => {
				if (data) {
					return data;
				}
				throw 'ENTITY NOT FOUND';
			});
		},
		getAuthor: function getAuthorId (authorId) {
			return dbUtility.list([authorId])
			.then ((data) => {
				if (data) {
					return data[0];
				}
				throw 'ENTITY NOT FOUND';
			});
		} 
	};
}