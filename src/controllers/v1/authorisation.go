package v1

import (
	"net/http"
	"net/url"
	"fmt"
	"strings"
	"strconv"
	"regexp"

	"github.com/labstack/echo"
	"auth/src/utils"
	utilServices "auth/src/utils/services"
)

var validResources = []string{"/pratilipis","/authors","/recommendation/pratilipis","/search/search","/search/trending_search","/follows","/userauthor/follow/list", "/userauthor/follow","/reviews","/userpratilipi","/userpratilipi/review","/userpratilipi/review/list","/userpratilipi/reviews","/comments","/comment","/comment/list","/vote","/votes", "/blog-scraper","/event","/event/list","/events","/event/pratilipi","/devices", "/notifications","/userpratilipi/library","/userpratilipi/library/list","/library", "/social-connect","/user/register","/user/login","/user/login/facebook","/user/login/google","/user/verification","/user/email","/user/passwordupdate","/user","/user/logout","/authors/recommendation","/pratilipi/content/batch","/pratilipi/content/chapter/add","/pratilipi/content/chapter/delete","/pratilipi/content/index","/pratilipi/content","/coverimage-recommendation","/template-engine","/growthjava","/report","/init","/users/v2.0/admins/users/*","/admins/users","/events/v2.0","/user/firebase-token"}

var validMethods = []string{"POST","GET","PUT","PATCH","DELETE"}

type response struct {
	message string
}

func Test(c echo.Context) error {
//	fmt.Println(c.Request().Header["Access-Token"])
	//validateParams("test",c)
	resp := response{"Hello test"}
	fmt.Println(resp)
	return c.JSON(http.StatusOK, resp)
}

func Validate(c echo.Context) error {


	var resourceType string
	var resourceIdArray []int64
	//var resources []interface{}
	var pratilipis []utilServices.Pratilipi
	var authors   []utilServices.Author
	var userId int64
	var accessToken string
	var err error

	type resourcePermission struct {
		Code int16 `json:"code"`
		Id int64 `json:"id"`
		IsAuthorized bool `json:"isAuthorized"`
	}

	var rpData []resourcePermission

	type responseBody struct {
		Resource string `json:"resource"`
		Method string `json:"method"`
		Data []resourcePermission `json:"data"`
	}

	aee := utils.Aee{}
	//role := utils.Role{}

	//Path mapping
	c = pathMapping("validate",c)

	//Reading headers
	accessTokenArr := c.Request().Header["Access-Token"]
	if len(accessTokenArr) > 0 {
		accessToken = accessTokenArr[0]
	}

	userIdArr := c.Request().Header["User-Id"]
	if len(userIdArr) > 0 {
		userId, err = strconv.ParseInt(userIdArr[0],10,64)
	}

	if len(accessToken) == 0 && userId == 0 {
		return c.JSON(http.StatusUnauthorized,nil)
	}

	//Reading query params
	resource := c.Get("resource")
	method := c.Get("method")
	resourceIds := c.QueryParam("id")
	language := c.QueryParam("language")
	authorId := c.QueryParam("authorId")
	state := c.QueryParam("state")
	//validationType := c.Get("validationType")
	slug := c.QueryParam("slug")


	if resource == "/userpratilipi/reviews" {
		resourceIds = c.QueryParam("pratilipiId")
	} else if (resource == "/reviews") {
		if (method == "POST") {
			resourceIds = c.QueryParam("parentId")
		}
	} else if (resource == "/comment") {
		if (method == "PATCH") {
			resourceIds = c.QueryParam("commentId")
		} else if (method == "GET") {
			resourceIds = c.QueryParam("parentId")
		}
	} else if (resource == "/comments") {
		if (method == "POST") {
			resourceIds = c.QueryParam("parentId")
		}
	} else if (resource == "/votes" || resource == "/vote") {
		resourceIds = c.QueryParam("parentId")
	} else if (resource == "/user") {
		if method == "PATCH" || (method == "GET" && len(c.QueryParam("userId")) > 0) {
			resourceIds = c.QueryParam("userId")
		}
	}

	if len(authorId) > 0 {
		resourceIds = authorId;
		resourceType = "AUTHOR";
	}

	if resource == "/recommendation/pratilipis" || 
		resource == "/search/search" || 
		resource == "/search/trending_search" || 
		(resource == "/follows" && method != "POST") || 
		resource == "/blog-scraper" || 
		(resource == "/events" && method == "GET" && len(resourceIds) == 0) || 
		resource == "/library" || 
		resource == "/social-connect" || 
		(resource == "/user" && method == "GET" && len(resourceIds) == 0) || 
		resource == "/authors/recommendation" || 
		(resource == "/notifications" && method == "GET" && len(resourceIds) == 0) || 
		(resource == "/init" && method == "GET" && len(resourceIds) == 0 )  || 
		( resource == "/report" && method == "POST" && len(resourceIds)  == 0 ) || 
		( (resource == "/authors" || resource == "/pratilipis") && method == "GET" && len(resourceIds) == 0 ) || 
		resource == "/growthjava" || 
		resource == "/template-engine" || 
		resource == "/coverimage-recommendation" || 
		(resource == "/user" && method == "GET" && len(resourceIds) == 0 ) {
		resourceIds = "0"

	}

	fmt.Println("After parameter mapping",resource, method, resourceIds, resourceType)

	//Parameter validations
	isValidResource := false
	for _,val := range validResources {
		if val == resource {
			isValidResource = true
		}
	}

	isValidMethod := false
	for _,val := range validMethods {
		if val == method {
			isValidMethod = true
		}
	}

	if !isValidResource ||
		!isValidMethod ||
		(method != "POST" && len(resourceIds) == 0 && len(slug) == 0) ||
		((resource == "/pratilipis" || resource == "/authors") && method == "POST" && len(language) == 0) {
		return c.JSON(http.StatusBadRequest, nil)
	}

	if method != "POST" || 
		(resource == "/pratilipis" && resourceType == "AUTHOR") || 
		(resource == "/follows") ||
		((resource == "/userpratilipi/reviews" || resource == "/reviews") && method == "POST") {
		if len(resourceIds) == 0 {
			return c.JSON(http.StatusBadRequest, nil)
		}

		tempResourceIdArray := strings.Split(resourceIds,",")
		for _,val := range tempResourceIdArray {
			temp,_ := strconv.ParseInt(val, 10, 64)
			resourceIdArray = append(resourceIdArray,temp)
		}
	}

	fmt.Println("After parameter validation",resource, method, resourceIds, resourceType)

	//Fetch UserId for given accessToken
	fmt.Println("Before getting userId from accessToken", userId, accessToken)
	if userId == 0 && len(accessToken) > 0 {
		userId, err = GetUserIdByAccessToken(accessToken)
		if err != nil {
			return c.JSON(http.StatusInternalServerError,nil)
		}
	}

	fmt.Println("After reading userid by access token", accessToken, userId)

	//TODO: Fetch respective resources
	if (resource == "/pratilipis" && method != "POST" && len(resourceType) > 0) || ((resource == "/reviews" || resource == "/userpratilipi/reviews") && method == "POST") {
		if len(slug) > 0 {
			pratilipis, err = utilServices.GetPratilipisBySlug(slug,accessToken)
			if err != nil {
				// handle error
			}
		} else if len(resourceIdArray) > 0 {
			pratilipis, err = utilServices.GetPratilipis(resourceIds, accessToken)
			if err != nil {
				// handle error
			}
		}

		if len(pratilipis) == 0 {
			return c.JSON(http.StatusForbidden, nil)
		}
	} else if (resource == "/authors" && (method == "PATCH" || method == "DELETE")) || 
			(resource == "/pratilipis" && resourceType == "AUTHOR") || 
			(resource == "/follows" && method == "POST" ) {
		if len(slug) > 0 {
			authors, err = utilServices.GetAuthorsBySlug(slug)
			if err != nil {
				// handle error
			}
		} else if len(resourceIdArray) > 0 {
			authors, err = utilServices.GetAuthors(resourceIds)
			if err != nil {
                                // handle error
                        }
		}

		if len(authors) == 0 {
			return c.JSON(http.StatusForbidden, nil)
		}
	}/* else if (resource == "/reviews" || resource == "/userpratilipi/reviews") && 
		(method == "PATCH" || method == "DELETE") {
		resources, err := GetReviews(resourceIdArray, accessToken)
		if err != nil {
			// handle error
		}
	} else if (resource == "/comments" || resource == "/comment") && 
		(method == "PATCH" || method == "DELETE") {
		resources, err := GetComments(resourceIdArray, userId)
		if err != nil {
			// handle error
		}
	}
	*/

	fmt.Println("After receiving the resources", resource, method)
	//roles := aee.GetRoles(userId)
	//TODO: Verify user-action-resource
	if resource == "/pratilipis" {
		fmt.Println("validating /pratilipis resource")
		if resourceType == "AUTHOR" {
			//author := resources[0].(utilServices.Author)
			author := authors[0]
			if method == "GET" {
				if state == "PUBLISHED" {
					rpData = append(rpData,resourcePermission{200, author.AuthorId, true});
				} else if (state == "DRAFTED") {
					if (author != utilServices.Author{} && userId == author.UserId) || aee.HasUserAccess(userId,author.Language,"AUTHOR_PRATILIPIS_READ") {
						rpData = append(rpData,resourcePermission{200, author.AuthorId, true});
					} else {
						rpData = append(rpData,resourcePermission{403, author.AuthorId, false});
					}
				} else {
					rpData = append(rpData,resourcePermission{403, author.AuthorId, false});
				}
			} else {
				if aee.HasUserAccess(userId,author.Language,"AUTHOR_PRATILIPIS_ADD") || aee.HasUserAccess(userId,author.Language,"PRATILIPI_ADD") {
					rpData = append(rpData,resourcePermission{200, author.AuthorId, true});
				} else {
					rpData = append(rpData,resourcePermission{403, author.AuthorId, false});
				}
			}
		} else {
			if (method == "POST") {
				var hasAccess = aee.HasUserAccess(userId, language, "PRATILIPI_ADD")
				if hasAccess {
					rpData = append(rpData,resourcePermission{200, 0, true})
				} else {
					rpData = append(rpData,resourcePermission{403, 0, false})
				}
			} else {
				for _,pratilipi := range pratilipis {
					//pratilipi := resource.(utilServices.Pratilipi)
					if (pratilipi != utilServices.Pratilipi{}) {
						var permission string
						if method == "GET" {
							if pratilipi.State == "DRAFTED" {
								permission = "PRATILIPI_READ_DRAFT_CONTENT"
							} else {
								permission = "PRATILIPI_READ_CONTENT"
							}
						} else if method == "PUT" || method == "PATCH" {
							permission = "PRATILIPI_UPDATE"
						} else if method == "DELETE" {
							permission = "PRATILIPI_DELETE"
						}

						language = pratilipi.Language;
						var hasAccess = aee.HasUserAccess(userId,language,permission)
						if (hasAccess) {
							if !aee.IsAee(userId) && 
								(permission == "PRATILIPI_UPDATE" || permission == "PRATILIPI_DELETE" || permission == "PRATILIPI_READ_DRAFT_CONTENT") {
								isAuthor := isUserAuthorToPratilipi(userId,pratilipi.PratilipiId)
								if isAuthor {
									rpData = append(rpData,resourcePermission{200, pratilipi.PratilipiId, true})
								} else {
									rpData = append(rpData,resourcePermission{403, pratilipi.PratilipiId, false})
								}
							} else {
								rpData = append(rpData,resourcePermission{200, pratilipi.PratilipiId, true})
							}
						} else {
							rpData = append(rpData,resourcePermission{403, pratilipi.PratilipiId, false})
						}
					} else {
						rpData = append(rpData,resourcePermission{403, 0, false})
					}
				}
			}
		}
	}

	//resource, method, data
	responseBodyObject := &responseBody{
		c.Get("originalResource").(string),
		c.Get("originalMethod").(string),
		rpData,
	}

	fmt.Println("After validating the resource",responseBodyObject)

	return c.JSON(http.StatusOK, responseBodyObject)
}

func isUserAuthorToPratilipi(userId ,pratilipiId int64) bool {
	return true
}

func pathMapping(apiType string, c echo.Context) echo.Context {
	isPathMapped := false
	var validationType string
	wildString := "/*"
	var originalResource string
	if apiType == "validate" {
		resource, _ := url.QueryUnescape(c.QueryParam("resource"))
		originalResource = resource
		if strings.HasPrefix(resource,"/blog-scraper") {
			re := regexp.MustCompile("/[a-z0-9]{22}")
			resource = re.ReplaceAllString(resource, wildString)
		} else {
			re := regexp.MustCompile("/[0-9]+")
			resource = re.ReplaceAllString(resource, wildString)
		}

		if resource == "/image/pratilipi/cover" || 
			resource == "/image/pratilipi/*/cover" || 
			resource == "/pratilipis/*" || 
			resource == "/image/pratilipi/content" || 
			resource == "/pratilipi/content/batch" || 
			resource == "/pratilipi/content/chapter/add" || 
			resource == "/pratilipi/content/chapter/delete" || 
			resource == "/pratilipi/content/index" || 
			resource == "/pratilipi/content" {
			resource = "/pratilipis"
			isPathMapped = true
		} else if resource == "/image/author/cover" || 
			resource == "/image/author/*/cover" || 
			resource == "/image/author/profile" || 
			resource == "/image/author/*/profile" || 
			resource == "/authors/*" {
			resource = "/authors"
			isPathMapped = true
		} else if resource == "/userauthor/follow/list" || 
			resource == "/userauthor/follow" {
			resource = "/follows"
		} else if resource == "/userpratilipi/library/list" || 
			resource == "/userpratilipi/library" || 
			strings.HasPrefix(resource,"/library") {
			resource = "/library"
		} else if resource == "/report/v1.0/report" {
			resource = "/report"
		} else if resource == "/notification/list" || 
			resource == "/notification" || 
			resource == "/notification/batch" {
			resource = "/notifications"
		} else if resource == "/init/v1.0/list" || 
			resource == "/init/v1.0/init" {
			resource = "/init"
		} else if resource == "/userpratilipi" || 
			resource == "/userpratilipi/review" || 
			resource == "/userpratilipi/review/list" {
			resource = "/userpratilipi/reviews";
		} else if resource == "/comment" || 
			resource == "/comment/list" {
			resource = "/comment"
			if c.QueryParam("method") == "POST" && 
				len(c.QueryParam("commentId")) > 0 {
				isPathMapped = true
			}
		} else if resource == "/blog-scraper" || 
			resource == "/blog-scraper/*" || 
			resource == "/blog-scraper/*/create" || 
			resource == "/blog-scraper/*/publish" || 
			resource == "/blog-scraper/*/scrape" || 
			resource == "/blog-scraper/search" {
			resource = "/blog-scraper"
		} else if resource == "/event" || 
			resource == "/event/list" || 
			resource == "/event/pratilipi" || 
			resource == "/image/event/banner" || 
			resource == "/events/v2.0" {
			resource = "/events"
		} else if resource == "/social-connect/access_token" || 
			resource == "/social-connect/contacts" || 
			resource == "/social-connect/access_token/unlink" || 
			resource == "/social-connect/access_token/remind_me_later" || 
			resource == "/social-connect/contacts/invite" || 
			resource == "/social-connect/referred/by_invitation" || 
			resource == "/social-connect/contacts/scrape_phone_contacts" {
			resource = "/social-connect"
		} else if resource == "/user/register" || 
			resource == "/user/login" || 
			resource == "/user/login/facebook" || 
			resource == "/user/login/google" {
			resource = "/user"
			validationType = "PRELOGIN"
		} else if resource == "/user/email" || 
			resource == "/user/passwordupdate" || 
			resource == "/user/verification" {
			resource = "/user"
			validationType = "NONE"
		} else if resource == "/user" || 
			resource == "/user/logout" || 
			resource == "/user/firebase-token" {
			resource = "/user"
			validationType = "POSTLOGIN"
			if len(c.QueryParam("userId")) > 0 {
				isPathMapped = true
			}
		} else if resource == "/growthjava/pratilipis/metadata" {
			resource = "/growthjava"
		} else if resource == "/template-engine/mobile/homescreen/widgets" || 
			resource == "/template-engine/callback/activities" {
			resource = "/template-engine"
		} else if resource == "/coverimage-recommendation/cover/select" || 
			resource == "/coverimage-recommendation/cover" {
			resource = "/coverimage-recommendation"
		} else if resource == "/users/v2.0/admins/users/*" {
			resource = "/admins/users"
		}

		//fmt.Println(originalResource, resource, validationType, c.QueryParam("method"))
		c.Set("originalResource",originalResource)
		c.Set("resource",resource)
		c.Set("validationType",validationType)
		c.Set("method",c.QueryParam("method"))
		c.Set("originalMethod",c.QueryParam("method"))
		if isPathMapped {
			if c.QueryParam("method") == "POST" {
				c.Set("originalMethod","POST")
				c.Set("method","PATCH")
			} else if c.QueryParam("method") == "DELETE" {
				c.Set("originalMethod","DELETE")
				c.Set("method","PATCH")
			}
		}


	}
	return c;
}

func GetUserIdByAccessToken(accessToken string) (int64,error) {
	val, err := utils.GetCache(accessToken)
	if err != nil {
		return 0, err
	}

	if (val == nil) {
		val, err = utilServices.GetUserIdByAccessToken(accessToken)
		if err != nil {
			return 0, err
		}

		// Insert into cache
		err = utils.SetCache(accessToken, val.(string),259200)
		if err != nil {
			//handle error
		}
	}
	return val.(int64),nil
}
