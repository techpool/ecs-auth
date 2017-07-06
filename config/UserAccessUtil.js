'use strict';

const Language = require("./Language.js").Language;
const AccessType = require("./AccessType.js").AccessType;

const MEMBER_ACCESS =[
			AccessType.PRATILIPI_ADD_REVIEW,
			AccessType.USER_PRATILIPI_REVIEW, AccessType.USER_PRATILIPI_LIBRARY,
			AccessType.USER_AUTHOR_FOLLOWING,
			AccessType.COMMENT_ADD, AccessType.COMMENT_UPDATE,
			AccessType.VOTE ];

const ADMIN_ACCESS = [
  AccessType.INIT_UPDATE,
			AccessType.PRATILIPI_LIST, AccessType.PRATILIPI_ADD, AccessType.PRATILIPI_UPDATE,
			AccessType.PRATILIPI_READ_META, AccessType.PRATILIPI_UPDATE_META, AccessType.PRATILIPI_READ_CONTENT,
			AccessType.AUTHOR_LIST, AccessType.AUTHOR_ADD, AccessType.AUTHOR_UPDATE,
			AccessType.EVENT_ADD, AccessType.EVENT_UPDATE,
			AccessType.BLOG_POST_LIST, AccessType.BLOG_POST_ADD, AccessType.BLOG_POST_UPDATE, AccessType.I18N_UPDATE
];

var Role = {};

Role.GUEST = {language:null,accessTypes:null};
Role.MEMBER = {language:null,accessTypes:MEMBER_ACCESS};
Role.ADMIN			={language:null,accessTypes:[AccessType.USER_ADD, AccessType.USER_UPDATE, AccessType.PRATILIPI_LIST, AccessType.BATCH_PROCESS_ADD, AccessType.BATCH_PROCESS_LIST]};
Role.ADMIN_BENGALI	={language:Language.BENGALI,accessTypes:ADMIN_ACCESS};
Role.ADMIN_GUJARATI	={language:Language.GUJARATI,accessTypes:ADMIN_ACCESS};
Role.ADMIN_HINDI		={language:Language.HINDI,accessTypes:ADMIN_ACCESS};
Role.ADMIN_KANNADA	={language:Language.KANNADA,accessTypes:ADMIN_ACCESS};
Role.ADMIN_MALAYALAM	={language:Language.MALAYALAM,accessTypes:ADMIN_ACCESS};
Role.ADMIN_MARATHI	={language:Language.MARATHI,accessTypes:ADMIN_ACCESS};
Role.ADMIN_TAMIL		={language:Language.TAMIL,accessTypes:ADMIN_ACCESS};
Role.ADMIN_TELUGU	={language:Language.TELUGU,accessTypes:ADMIN_ACCESS};
Role.ADMINISTRATOR	={language:null,accessTypes:Object.values(AccessType)};

class Roles{
	constructor ( role ) {
		this.language = role.language;
		this.accessTypes = role.accessTypes;
	}

	hasAccess(language, accessType ) {
		if( this.language !== null && this.language !== language ){
				return false;
			}
		if( this.accessTypes === null ) {
				return false;
			}

			var keys = Object.keys(this.accessTypes);

			for(var i = 0; i< keys.length;i++){
				var att = keys[i];
				var at = this.accessTypes[att];
				if( accessType === at ) {
					return true;
				}
			}
			return false;
	}
}

 var AEE = {};

 AEE.MOUMITA = {userId:6243664397336576, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI] };
		AEE.NIMISHA = {userId:5644707593977856, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI] };
		AEE.VEENA   = {userId:4790800105865216, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_MARATHI ]};
		AEE.VRUSHALI= {userId:4900189601005568, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_MARATHI, Role.ADMIN_HINDI ]};

		AEE.BRINDA  = {userId:6046961763352576, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_GUJARATI] };
		AEE.KIMAYA  = {userId:5373377891008512, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_MARATHI, Role.ADMIN_HINDI] };
		AEE.JITESH  = {userId:5743817900687360, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_MARATHI] };
		AEE.SHALLY  = {userId:5664902681198592, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_MARATHI] };

		AEE.VAISAKH     = {userId:5666355716030464, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_MALAYALAM ]};
		AEE.DIPLEEPAN   = {userId:4900071594262528, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_TAMIL ]};
		AEE.JOHNY       = {userId:5187684625547264, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_TELUGU ]};
		AEE.ARUNA       = {userId:5715256422694912, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_KANNADA ]};
		AEE.SANKAR      = {userId:5991416564023296, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_KANNADA, Role.ADMIN_MALAYALAM, Role.ADMIN_MARATHI, Role.ADMIN_TAMIL, Role.ADMIN_TELUGU ]};

		AEE.DRASTI  = {userId:4908348089565184, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_HINDI, Role.ADMIN_GUJARATI ]};
		AEE.ANURAG  = {userId:5013864096727040, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_HINDI ]};

		AEE.RADHIKA = {userId:5124071978172416, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_HINDI, Role.ADMIN_TAMIL ]};
		AEE.ABHISHEK= {userId:5694768648552448, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_KANNADA, Role.ADMIN_MALAYALAM, Role.ADMIN_MARATHI, Role.ADMIN_TAMIL, Role.ADMIN_TELUGU ]};
		AEE.RAHUL= {userId:5073076857339904, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_KANNADA, Role.ADMIN_MALAYALAM, Role.ADMIN_MARATHI, Role.ADMIN_TAMIL, Role.ADMIN_TELUGU ]};
		AEE.SHREYANS= {userId:5451511011213312, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_KANNADA, Role.ADMIN_MALAYALAM, Role.ADMIN_MARATHI, Role.ADMIN_TAMIL, Role.ADMIN_TELUGU ]};
		AEE.RANJEET = {userId:6264191547604992, roles:[Role.MEMBER, Role.ADMIN, Role.ADMIN_BENGALI, Role.ADMIN_GUJARATI, Role.ADMIN_HINDI, Role.ADMIN_KANNADA, Role.ADMIN_MALAYALAM, Role.ADMIN_MARATHI, Role.ADMIN_TAMIL, Role.ADMIN_TELUGU ]};
		AEE.RAGHU   = {userId:6196244602945536, roles:[Role.MEMBER, Role.ADMINISTRATOR ]};
		AEE.PRASHANT= {userId:5705241014042624, roles:[Role.MEMBER, Role.ADMINISTRATOR ]};

class AEES {

	getRoles(userId) {
		if( userId === 0 ) {
			return [Role.GUEST ];
		}
		var keys = Object.keys(AEE);
		for(var i = 0; i< keys.length;i++) {
			var aEE = keys[i];
			var value = AEE[aEE];
			if( userId === value.userId  ) {
				return value.roles;
			}
		}
		return [Role.MEMBER ];
	}

	hasUserAccess(userId,language,accessType) {
		var roles = this.getRoles(userId);
		for(var i = 0; i< roles.length;i++) {
			var role = new Roles(roles[i]);
			if(role.hasAccess(language,accessType)){
				return true;
			}
		}
		return false;
	}

	getAeeUserIdList(language) {
		var aeeUserIdList = [];
		var keys = Object.keys(AEE);
		for(var i = 0; i< keys.length;i++) {
			var aEEE = keys[i];
			var aEE = AEE[aEEE];
			var keys2 = Object.keys(aEE.roles);
			for(var j = 0;j<keys2.length;j++){
				var roleq = keys2[j];
				var role = aEE.roles[roleq];
				var roleObject = new Roles(role);
				if(role.language === language ) {
					aeeUserIdList.push(aEE.userId);
				}
			}
		}
		return aeeUserIdList;
	}
}


module.exports = AEES;
