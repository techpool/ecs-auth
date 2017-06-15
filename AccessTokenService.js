module.exports = AccessToken;

var dbUtility = require( './lib/DatastoreUtility' );

function AccessToken ( config ) {

  // private data
  dbUtility = dbUtility( { projectId: config.projectId, resourceType: 'ACCESS_TOKEN' } );

  // API/data for end-user

  return {
    getUserId: function getUserId( accessToken ) {
      return dbUtility
        .getResourceFromDb( accessToken )
        .then( ( accessTokenEntity ) => {
          if( accessTokenEntity ) {
            return accessTokenEntity.USER_ID;
          }
          throw 'ENTITY NOT FOUND';
        })
        ;
    }
  };
}