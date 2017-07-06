var AccessType = {};

AccessType = {
	              INIT_UPDATE                  : "Update Home" ,
	              USER_ADD                     : "Add User" ,
	              USER_UPDATE                  : "Update User" ,
              	PRATILIPI_LIST		           : "List Pratilipi" ,
              	PRATILIPI_ADD		             : "Add Pratilipi" ,
              	PRATILIPI_UPDATE	           : "Update Pratilipi" ,
              	PRATILIPI_READ_META	         : "View Pratilipi Meta Data" ,
              	PRATILIPI_UPDATE_META        : "Update Pratilipi Meta Data" ,
              	PRATILIPI_ADD_REVIEW         : "Add Pratilipi Review" ,
              	PRATILIPI_READ_CONTENT       : "View Pratilipi Content" ,
              	PRATILIPI_UPDATE_CONTENT     : "Update Pratilipi Content" ,
              	AUTHOR_LIST	                 : "List Author" ,
              	AUTHOR_ADD	                 : "Add Author" ,
              	AUTHOR_UPDATE                : "Update Author" ,
              	EVENT_ADD	                   : "Add Event" ,
              	EVENT_UPDATE                 : "Update Event" ,
              	I18N_UPDATE                  : "Update I18N Table" ,
              	BLOG_POST_LIST	             : "List BlogPost" ,
              	BLOG_POST_ADD	               : "Add BlogPost" ,
              	BLOG_POST_UPDATE             : "Update BlogPost" ,
              	USER_PRATILIPI_REVIEW		     : "Updating RATING, REVIEW fields in USER_PRATILIPI." ,
              	USER_PRATILIPI_ADDED_TO_LIB	 : "Updating ADDED_TO_LIB field in USER_PRATILIPI." ,
              	USER_PRATILIPI_LIBRARY		   : "Updating LAST_OPENED_PAGE, ADDED_TO_LIB fields in USER_PRATILIPI." ,
              	USER_AUTHOR_FOLLOWING		     : "Updating FOLLOWING field in USER_AUTHOR." ,
              	COMMENT_ADD                  : "Add Comment" ,
              	COMMENT_UPDATE               : "Update Comment" ,
              	VOTE                         : "Vote" ,
              	MAILING_LIST_SUBSCRIPTION_ADD: "Add Mailing List Subscription" ,
              	BATCH_PROCESS_LIST		       : "List BatchProcess" ,
              	BATCH_PROCESS_ADD		         : "Add BatchProcess"
};

module.exports.AccessType = AccessType;
