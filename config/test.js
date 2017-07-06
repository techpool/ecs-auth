const a = require('./UserAccessUtil.js');
const Language = require("./Language.js").Language;
const AccessType = require("./AccessType.js").AccessType;

var b = new a();

var some = b.hasUserAccess(1,Language.HINDI,AccessType.INIT_UPDATE);
console.log(some);
