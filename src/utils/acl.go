package utils

import (
	"strings"
)

type language struct {
	code string
	name string
	nameEn string
	hostName string
}

type Role struct {
	language language
	accessTypes []string
}

type Aee struct {
	userId int64
	roles []Role
}

var accessTypeMap = map[string] []string {
		"GUEST_ACCESS":			[]string{"PRATILIPI_READ_CONTENT","AUTHOR_READ"},
		"MEMBER_ACCESS": 		[]string{"PRATILIPI_ADD_REVIEW","PRATILIPI_UPDATE","PRATILIPI_ADD","PRATILIPI_DELETE","USER_PRATILIPI_REVIEW","USER_PRATILIPI_LIBRARY","PRATILIPI_READ_CONTENT","AUTHOR_READ","AUTHOR_UPDATE","USER_AUTHOR_FOLLOWING","COMMENT_ADD","COMMENT_UPDATE","VOTE","PRATILIPI_READ_CONTENT","PRATILIPI_READ_DRAFT_CONTENT"},
		"ADMIN_ACCESS": 		[]string{"INIT_UPDATE","PRATILIPI_LIST","PRATILIPI_ADD","PRATILIPI_UPDATE","PRATILIPI_DELETE","PRATILIPI_READ_META","PRATILIPI_UPDATE_META","PRATILIPI_READ_CONTENT","AUTHOR_LIST","AUTHOR_ADD","AUTHOR_UPDATE","AUTHOR_READ","AUTHOR_PRATILIPIS_READ","AUTHOR_PRATILIPIS_ADD","EVENT_ADD","EVENT_UPDATE","BLOG_POST_LIST","BLOG_POST_ADD","BLOG_POST_UPDATE","I18N_UPDATE","PRATILIPI_READ_DRAFT_CONTENT"},
		"ADMINISTRATOR_ACCESS": []string{"INIT_UPDATE","USER_ADD","USER_UPDATE","PRATILIPI_LIST","PRATILIPI_ADD","PRATILIPI_UPDATE","PRATILIPI_READ_META","PRATILIPI_UPDATE_META","PRATILIPI_ADD_REVIEW","PRATILIPI_READ_CONTENT","PRATILIPI_UPDATE_CONTENT","PRATILIPI_DELETE","PRATILIPI_READ_DRAFT_CONTENT","AUTHOR_LIST","AUTHOR_ADD","AUTHOR_UPDATE","AUTHOR_READ","AUTHOR_DELETE","AUTHOR_PRATILIPIS_READ","AUTHOR_PRATILIPIS_ADD","EVENT_ADD","EVENT_UPDATE","I18N_UPDATE","BLOG_POST_LIST","BLOG_POST_ADD","BLOG_POST_UPDATE","USER_PRATILIPI_REVIEW","USER_PRATILIPI_ADDED_TO_LIB","USER_PRATILIPI_LIBRARY","USER_AUTHOR_FOLLOWING","COMMENT_ADD","COMMENT_UPDATE","VOTE","MAILING_LIST_SUBSCRIPTION_ADD","BATCH_PROCESS_LIST","BATCH_PROCESS_ADD"},
	}

var languageMap = map[string] language {
	"HINDI": 	{"hi","हिंदी","Hindi","hindi.pratilipi.com"},
	"GUJARATI":	{"gu","ગુજરાતી","Gujarati","gujarati.pratilipi.com"},
	"TAMIL":	{"ta","தமிழ்","Tamil","tamil.pratilipi.com"},
	"MARATHI":	{"mr","मराठी","Marathi","marathi.pratilipi.com"},
	"MALAYALAM":{"ml","മലയാളം","Malayalam","malayalam.pratilipi.com"},
	"BENGALI":	{"bn","বাংলা","Bengali","bengali.pratilipi.com"},
	"TELUGU":	{"te","తెలుగు","Telugu","telugu.pratilipi.com"},
	"KANNADA":	{"kn","ಕನ್ನಡ","Kannada","kannada.pratilipi.com"},
	"ENGLISH":	{"en","English","English","www.pratilipi.com"},
}

var roleMap = map[string] Role {
	"GUEST": 			{language{}, accessTypeMap["GUEST_ACCESS"]},
	"MEMBER": 			{language{}, accessTypeMap["MEMBER_ACCESS"]},
	"ADMIN": 			{language{}, []string{"USER_ADD","USER_UPDATE","PRATILIPI_LIST","BATCH_PROCESS_ADD","BATCH_PROCESS_LIST"}},
	"ADMIN_BENGALI": 	{languageMap["BENGALI"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMIN_GUJARATI": 	{languageMap["GUJARATI"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMIN_HINDI": 		{languageMap["HINDI"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMIN_KANNADA": 	{languageMap["KANNADA"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMIN_MALAYALAM": 	{languageMap["MALAYALAM"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMIN_MARATHI": 	{languageMap["MARATHI"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMIN_TAMIL": 		{languageMap["TAMIL"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMIN_TELUGU": 	{languageMap["TELUGU"],accessTypeMap["ADMIN_ACCESS"]},
	"ADMINISTRATOR": 	{language{}, accessTypeMap["ADMINISTRATOR_ACCESS"]},
}

var aeeMap = map[string] Aee {
	"MOUMITA": 		{6243664397336576, []Role{roleMap["MEMBER"],roleMap["ADMIN"],roleMap["ADMIN_BENGALI"]}},
	"NIMISHA": 		{5644707593977856, []Role{roleMap["MEMBER"],roleMap["ADMIN"],roleMap["ADMIN_GUJARATI"],roleMap["ADMIN_HINDI"]}},
	"VEENA": 		{4790800105865216, []Role{roleMap["MEMBER"],roleMap["ADMIN"],roleMap["ADMIN_GUJARATI"],roleMap["ADMIN_HINDI"],roleMap["ADMIN_MARATHI"]}},
	"VRUSHALI": 	{4900189601005568, []Role{roleMap["MEMBER"],roleMap["ADMIN"],roleMap["ADMIN_HINDI"],roleMap["ADMIN_MARATHI"]}},
	"BRINDA": 		{6046961763352576, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_GUJARATI"]}},
    "KIMAYA": 		{5373377891008512, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_HINDI"]}},
	"JITESH": 		{5743817900687360, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_MARATHI"]}},
	"SHALLY": 		{5664902681198592, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_MARATHI"]}},
	"VAISAKH": 		{5666355716030464, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_MALAYALAM"]}},
	"DIPLEEPAN": 	{4900071594262528, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_TAMIL"]}},
	"JOHNY": 		{5187684625547264, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_TELUGU"]}},
	"AKSHAY": 		{6755388383982685, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_KANNADA"]}},
	"SANKAR": 		{5991416564023296, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"DRASTI": 		{4908348089565184, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_GUJARATI"]}},
	"ANURAG":     	{5013864096727040, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_HINDI"]}},
	"RADHIKA":    	{5124071978172416, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"ABHISHEK":   	{5694768648552448, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"RAHUL":      	{5073076857339904, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"RANJEET":    	{6264191547604992, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"GAURI":      	{6311393362968576, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"RAGHU":      	{6196244602945536, []Role{roleMap["MEMBER"], roleMap["ADMINISTRATOR"]}},
	"PRASHANT":   	{5705241014042624, []Role{roleMap["MEMBER"], roleMap["ADMINISTRATOR"]}},
	"SURYADEEP":  	{5853379468197888, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"GAURIDEVO":  	{9, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},
	"GABBARDEVO": 	{6, []Role{roleMap["MEMBER"], roleMap["ADMIN"], roleMap["ADMIN_BENGALI"], roleMap["ADMIN_GUJARATI"], roleMap["ADMIN_HINDI"], roleMap["ADMIN_KANNADA"], roleMap["ADMIN_MALAYALAM"], roleMap["ADMIN_MARATHI"], roleMap["ADMIN_TAMIL"], roleMap["ADMIN_TELUGU"]}},	
}


func (role Role) HasAccess (language, permission string) bool {
	
	// Validate language for the role
	if role.language.name != "" && strings.ToLower(language) != strings.ToLower(role.language.nameEn) {
		return false
	}
	
	// Check if this role has the permission
	for _, p := range role.accessTypes {
      		if p == permission {
         		return true
      		}
   	}
   	return false
	
}


func (aee Aee) GetRoles (userId int64) []Role {

	if userId == 0 {
		return []Role{roleMap["GUEST"]}
	}
	
	for _, value := range aeeMap {
		if value.userId == userId {
			return value.roles
		}
	}
	
	return []Role{roleMap["MEMBER"]}
}


func (aee Aee) HasUserAccess (userId int64, language string, permission string) bool {
	
	if len(permission) == 0 {
		return false
	}
	
	roles := aee.GetRoles(userId)
	
	for _, r := range roles {
		if r.HasAccess (language, permission) {
			return true
		}
	}
	return false
}

func (aee Aee) IsAee (userId int64) bool {
	if userId == 0 {
		return false
	}
	
	for _, value := range aeeMap {
		if value.userId == userId {
			return true
		}
	}
	
	return false
}
