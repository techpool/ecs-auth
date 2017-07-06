
var Language = {};

Language.HINDI	 	={"code":"hi", "name":"हिंदी",			 "nameEn":"Hindi",	     "hostName":"hindi.pratilipi.com" };
Language.GUJARATI ={"code":"gu", "name":"ગુજરાતી",	 "nameEn":"Gujarati",	  "hostName":"gujarati.pratilipi.com" };
Language.TAMIL	 	={"code":"ta", "name":"தமிழ்",		 "nameEn":"Tamil",	     "hostName":"tamil.pratilipi.com" };
Language.MARATHI	={"code":"mr", "name":"मराठी",		  "nameEn":"Marathi",	   "hostName":"marathi.pratilipi.com" };
Language.MALAYALAM={"code":"ml", "name":"മലയാളം",	 "nameEn":"Malayalam", "hostName":"malayalam.pratilipi.com" };
Language.BENGALI	={"code":"bn", "name":"বাংলা",			"nameEn":"Bengali",    "hostName": "bengali.pratilipi.com" };
Language.TELUGU	 	={"code":"te", "name":"తెలుగు",		 "nameEn":"Telugu",     "hostName":  "telugu.pratilipi.com" };
Language.KANNADA	={"code":"kn", "name":"ಕನ್ನಡ",		 "nameEn":"Kannada",     "hostName":"kannada.pratilipi.com" };
Language.ENGLISH  ={"code":"en", "name":"English",	"nameEn":"English",	     "hostName":  "www.pratilipi.com" };

Language.getStringId = function(code) {
	return "_language_"+code;
};

module.exports.Language = Language;
