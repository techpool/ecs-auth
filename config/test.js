const a = require('./UserAccessUtil.js');
const Language = require("./Language.js").Language;
const AccessType = require("./AccessType.js").AccessType;

var b = new a();

var some = b.hasUserAccess(1,Language.HINDI,AccessType.PRATILIPI_ADD_REVIEW);
console.log(some);

some = b.getAeeUserIdList(Language.HINDI);
console.log(some);
