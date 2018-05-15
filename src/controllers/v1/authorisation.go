package v1

import (
	"net/http"
	"net/url"
	"log"
	"strings"
	"strconv"
	"regexp"
	"encoding/json"
	"errors"

	"github.com/labstack/echo"
	"auth/src/utils"
	utilServices "auth/src/utils/services"
)

var validResources = []string{"/pratilipis","/authors","/recommendation/pratilipis","/search/search","/search/trending_search","/follows","/userauthor/follow/list", "/userauthor/follow","/reviews","/userpratilipi","/userpratilipi/review","/userpratilipi/review/list","/userpratilipi/reviews","/comments","/comment","/comment/list","/vote","/votes", "/blog-scraper","/event","/event/list","/events","/event/pratilipi","/devices", "/notifications","/userpratilipi/library","/userpratilipi/library/list","/library", "/social-connect","/user/register","/user/login","/user/login/facebook","/user/login/google","/user/verification","/user/email","/user/passwordupdate","/user","/user/logout","/authors/recommendation","/pratilipi/content/batch","/pratilipi/content/chapter/add","/pratilipi/content/chapter/delete","/pratilipi/content/index","/pratilipi/content","/coverimage-recommendation","/template-engine","/growthjava","/report","/init","/users/v2.0/admins/users/*","/admins/users","/events/v2.0","/user/firebase-token","/oasis","/user_pratilipi/v2.0/user_pratilipis","/blogs","/content", "/event-participate"}

var validMethods = []string{"POST","GET","PUT","PATCH","DELETE"}

type errorResponse struct {
	Message string `json:"message"`
}

func Test(c echo.Context) error {
	resp := errorResponse{"Hello test"}
	log.Println(resp)
	return c.JSON(http.StatusOK, resp)
}

func Validate(c echo.Context) error {


	var resourceType string
	var resourceIdArray []int64
	var pratilipis []utilServices.Pratilipi
	var authors   []utilServices.Author
	var reviews []utilServices.Review
	var comments []utilServices.Comment
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

	if len(accessTokenArr) == 0 && len(userIdArr) == 0 || accessToken == "null" {
		return c.JSON(http.StatusUnauthorized,errorResponse{"Access Token is invalid"})
	}

	//Fetch UserId for given accessToken
	if userId == 0 && len(accessToken) > 0 {
		userId, err = GetUserIdByAccessToken(accessToken)
		if err != nil {
			log.Println("Error: While getting userId for accessToken",accessToken);
			if err.Error() == "AccessToken not found" {
				return c.JSON(http.StatusUnauthorized,errorResponse{"Access Token is invalid"})
			} else {
				return c.JSON(http.StatusInternalServerError,errorResponse{"Some exception occured while processing accesstoken"})
			}
		}
	}

	log.Printf("After reading userid %v for accessToken %v", userId, accessToken)

	//Reading query params
	resource := c.Get("resource")
	method := c.Get("method")
	resourceIds := c.QueryParam("id")
	language := c.QueryParam("language")
	authorId := c.QueryParam("authorId")
	state := c.QueryParam("state")
	validationType := c.Get("validationType")
	slug := c.QueryParam("slug")
	userIdQP,err := strconv.ParseInt(c.QueryParam("userId"),10,64)

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

	if authorId != "null" && len(authorId) > 0 {
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
		resource == "/user_pratilipi/v2.0/user_pratilipis" || 
		resource == "/social-connect" || 
		(resource == "/user" && method == "GET" && len(resourceIds) == 0) || 
		resource == "/authors/recommendation" || 
		(resource == "/notifications" && method == "GET" && len(resourceIds) == 0) || 
		(resource == "/init" && method == "GET" && len(resourceIds) == 0 )  || 
		( resource == "/report" && method == "POST" && len(resourceIds)  == 0 ) || 
		( (resource == "/authors" || resource == "/pratilipis") && method == "GET" && len(resourceIds) == 0 ) || 
		resource == "/growthjava" || 
		resource == "/template-engine" || 
		resource == "/event-participate" ||
		resource == "/coverimage-recommendation" || 
		(resource == "/user" && method == "GET" && len(resourceIds) == 0 || 
		resource == "/oasis" || 
		resource == "/blogs") {
		resourceIds = "0"

	}

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
		return c.JSON(http.StatusBadRequest, errorResponse{"Insufficient/invalid parameters in request"})
	}

	if method != "POST" ||
		(resource == "/pratilipis" && resourceType == "AUTHOR") || 
		(resource == "/follows") ||
		((resource == "/userpratilipi/reviews" || resource == "/reviews") && method == "POST") {
		if len(resourceIds) == 0 {
			return c.JSON(http.StatusBadRequest, errorResponse{"Insufficient/invalid parameters in request"})
		}

		tempResourceIdArray := strings.Split(resourceIds,",")
		for _,val := range tempResourceIdArray {
			temp,_ := strconv.ParseInt(val, 10, 64)
			resourceIdArray = append(resourceIdArray,temp)
		}
	}

	log.Printf("After parameter mapping & validating. resource: %v, method: %v, resourceIds: %v, resourceType: %v",resource, method, resourceIds, resourceType)

	//TODO: Fetch respective resources
	if (resource == "/pratilipis" && method != "POST" && len(resourceType) == 0) || ((resource == "/reviews" || resource == "/userpratilipi/reviews") && method == "POST") {

		log.Printf("Getting pratilipis resource for slug %v, resourceIds %v", slug, resourceIds)
		if len(slug) > 0 {
			pratilipis, err = utilServices.GetPratilipisBySlug(slug,accessToken)
			if err != nil {
				// handle error
				log.Println("Error while getting pratilipis")
			}
		} else if len(resourceIdArray) > 0 {
			pratilipis, err = utilServices.GetPratilipis(resourceIds, accessToken)
			if err != nil {
				// handle error
				log.Println("Error while getting pratilipis")
			}
		}
		log.Println("Got pratilips: ", pratilipis)
		if len(pratilipis) == 0 {
			return c.JSON(http.StatusForbidden, errorResponse{"Invalid resource ids"})
		}
	} else if (resource == "/authors" && (method == "PATCH" || method == "DELETE")) || 
			(resource == "/pratilipis" && resourceType == "AUTHOR") || 
			(resource == "/follows" && method == "POST" ) {
		log.Printf("Getting authors resource for slug %v, resourceIds %v", slug, resourceIds)
		if len(slug) > 0 {
			authors, err = utilServices.GetAuthorsBySlug(slug)
			if err != nil {
				// handle error
				log.Println("Error while getting authors")
			}
		} else if len(resourceIdArray) > 0 {
			authors, err = utilServices.GetAuthors(resourceIds)
			if err != nil {
                                // handle error
				log.Println("Error while getting authors")
			}
		}
		log.Println("Got authors: ", pratilipis)
		if len(authors) == 0 {
			return c.JSON(http.StatusForbidden, errorResponse{"Invalid resource ids"})
		}
	} else if (resource == "/reviews" || resource == "/userpratilipi/reviews") && 
		(method == "PATCH" || method == "DELETE") {
		log.Printf("Getting reviews resource for resourceIds %v", resourceIds)
		reviews, err = utilServices.GetReviews(resourceIds, userId)
		if err != nil {
			// handle error
			log.Println("Error while getting reviews")
		}
		if len(reviews) == 0 {
			return c.JSON(http.StatusForbidden, errorResponse{"Invalid resource ids"})
		}
	} else if (resource == "/comments" || resource == "/comment") && 
		(method == "PATCH" || method == "DELETE") {
		comments, err = utilServices.GetComments(resourceIds, userId)
		if err != nil {
			// handle error
			log.Println("Error while getting comments")
		}
		if len(comments) == 0 {
			 return c.JSON(http.StatusForbidden, errorResponse{"Invalid resource ids"})
		}
	}


	//Verify user-action-resource
	log.Printf("After receiving the resources going to validate. resource %v, method %v", resource, method)
	if resource == "/pratilipis" {
		log.Println("validating /pratilipis resource", resourceType, method, pratilipis)
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
			if method == "POST" {
				var hasAccess = aee.HasUserAccess(userId, language, "PRATILIPI_ADD")
				if hasAccess {
					rpData = append(rpData,resourcePermission{200, 0, true})
				} else {
					rpData = append(rpData,resourcePermission{403, 0, false})
				}
			} else {

				if len(pratilipis) > 0 {
					authors, _ = getAuthorsForPratilipis(pratilipis)
				}
				for i,pratilipi := range pratilipis {
					//pratilipi := resource.(utilServices.Pratilipi)
					log.Println("The pratilipi to validate",pratilipi)

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
						log.Println("validation in progress ", hasAccess, userId, language, permission)
						if (hasAccess) {
							if !aee.IsAee(userId) && 
								(permission == "PRATILIPI_UPDATE" || permission == "PRATILIPI_DELETE" || permission == "PRATILIPI_READ_DRAFT_CONTENT") {
								//isAuthor := isUserAuthorToPratilipi(userId,pratilipi.AuthorId)
								//log.Println("Validate update check for user on pratilipi", isAuthor)
								//if isAuthor {
								if len(authors) == 0 {
									rpData = append(rpData,resourcePermission{403, pratilipi.PratilipiId, false})
								} else if authors[i].UserId == userId {
									rpData = append(rpData,resourcePermission{200, pratilipi.PratilipiId, true})
								} else {
									rpData = append(rpData,resourcePermission{403, pratilipi.PratilipiId, false})
								}
							} else {
								rpData = append(rpData,resourcePermission{200, pratilipi.PratilipiId, true})
							}
						} else {
							log.Println("User has noaccess to pratilipi")
							rpData = append(rpData,resourcePermission{403, pratilipi.PratilipiId, false})
						}
					} else {
						rpData = append(rpData,resourcePermission{403, 0, false})
					}
				}
			}
		}
	} else if resource == "/authors" {
		if method == "POST" {
			var hasAccess = aee.HasUserAccess(userId,language,"AUTHOR_ADD")
			if hasAccess {
				rpData = append(rpData,resourcePermission{200,0,true})
			} else {
				rpData = append(rpData,resourcePermission{403,0,false})
			}
		} else if method == "GET" {
			for _, val := range resourceIdArray {
				rpData = append(rpData,resourcePermission{200,val,true})
			}
		} else {
			for i, author := range authors {
				if author != (utilServices.Author{}) {
					var permission string
					if method == "PUT" || method == "PATCH" {
						permission = "AUTHOR_UPDATE"
					} else if method == "DELETE"{
						permission = "AUTHOR_DELETE"
					}

					language = author.Language

					var hasAccess = aee.HasUserAccess(userId,language,permission)
					if hasAccess {
						if !aee.IsAee(userId) && permission == "AUTHOR_UPDATE" {
							if userId == author.UserId {
								rpData = append(rpData,resourcePermission{200, author.AuthorId, true})
							} else {
								rpData = append(rpData,resourcePermission{403, author.AuthorId, false})
							}
						} else {
							rpData = append(rpData,resourcePermission{200, author.AuthorId, true})
						}
					} else {
						rpData = append(rpData,resourcePermission{403, author.AuthorId, false})
					}
				} else {
					rpData = append(rpData,resourcePermission{403, resourceIdArray[i], false})
				}
			}

		}
	} else if resource == "/follows" {
		log.Println("validating follows ",resource, method, language, userId, authors, resourceIdArray)
		if method == "POST" {
			var hasAccess = aee.HasUserAccess(userId, language, "USER_AUTHOR_FOLLOWING")
			if hasAccess {
				var author = authors[0]
				if author != (utilServices.Author{}) && author.UserId == userId {
					rpData = append(rpData,resourcePermission{403, author.AuthorId, false})
				} else {
					rpData = append(rpData,resourcePermission{200, author.AuthorId, true})
				}
			} else {
				rpData = append(rpData,resourcePermission{403, resourceIdArray[0], false})
			}
		} else {
			rpData = append(rpData,resourcePermission{200, resourceIdArray[0], true})
		}
	} else if resource == "/reviews" || resource == "/userpratilipi/reviews" {
		log.Println("validating reviews - ",method, pratilipis, reviews, userId, aee.IsAee(userId))
		if method == "POST" {
			if userId == 0 {
				rpData = append(rpData,resourcePermission{403, 0, false})
			} else {
				pratilipi := pratilipis[0]
				//var author utilServices.Author
				if pratilipi != (utilServices.Pratilipi{}) {
					tempAuthors, err := utilServices.GetAuthors(strconv.FormatInt(pratilipi.AuthorId,10))
					log.Println("Authors in review are ",tempAuthors)
					if err != nil || len(tempAuthors) == 0 || tempAuthors[0] == (utilServices.Author{}) {
						rpData = append(rpData,resourcePermission{403, 0, false})
					} else {
						author := tempAuthors[0]
						if author.UserId != userId {
							 rpData = append(rpData,resourcePermission{200, 0, true})
						} else {
							 rpData = append(rpData,resourcePermission{403, 0, false})
						}
					}
				}
			}
		} else if method == "GET" {
			rpData = append(rpData,resourcePermission{200, resourceIdArray[0], true})
		} else {
			review := reviews[0]
			if review != (utilServices.Review{}) && review.User.Id == userId || aee.IsAee(userId) {
				rpData = append(rpData,resourcePermission{200, review.Id, true})
			} else {
				rpData = append(rpData,resourcePermission{403, review.Id, false})
			}
		}
	} else if resource == "/comments" || resource == "/comment" {
		log.Println("validating comments - ",method,  comments, userId)
		if method == "POST" {
			if userId == 0 {
				rpData = append(rpData,resourcePermission{403, 0, false})
			} else {
				rpData = append(rpData,resourcePermission{200, 0, true})
			}
		} else if method == "GET" {
			rpData = append(rpData,resourcePermission{200, resourceIdArray[0], true})
		} else {
			if len(comments) > 0 {
				comment := comments[0]
				if comment != (utilServices.Comment{}) && comment.User.Id == userId {
					rpData = append(rpData,resourcePermission{200, comment.Id, true})
				} else {
					rpData = append(rpData,resourcePermission{403, comment.Id, false})
				}
			} else {
				rpData = append(rpData,resourcePermission{403, 0, false})
			}
		}
	} else if resource == "/votes" || resource =="/vote" {
		log.Println("validating votes", resource, method, userId)
		if method == "POST" {
			if userId == 0 {
				rpData = append(rpData,resourcePermission{403, 0, false})
			} else {
				rpData = append(rpData,resourcePermission{200, 0, true})
			}
		} else {
			rpData = append(rpData,resourcePermission{200, 0, true})
		}
	} else if resource == "/recommendation/pratilipis" || 
		resource == "/search/search" || 
		resource == "/search/trending_search" || 
		resource == "/authors/recommendation" {
		rpData = append(rpData,resourcePermission{200, 0, true})
	} else if resource == "/social-connect" {
		log.Println("validating ", resource, userId)
		if userId == 0 {
			rpData = append(rpData,resourcePermission{403, 0, false})
		} else {
			rpData = append(rpData,resourcePermission{200, 0, true})
		}
	} else if resource == "/event-participate" {
		log.Println("validating ", resource, userId)
		if userId == 0 {
			rpData = append(rpData,resourcePermission{403, 0, false})
		} else {
			rpData = append(rpData,resourcePermission{200, 0, true})
		}
	} else if resource == "/template-engine" {
                log.Println("validating ", resource, userId)
                if userId == 0 {
                        rpData = append(rpData,resourcePermission{403, 0, false})
                } else {
                        rpData = append(rpData,resourcePermission{200, 0, true})
                }
        } else if resource == "/growthjava" {
		rpData = append(rpData,resourcePermission{200, 0, true})
	} else if resource == "/coverimage-recommendation" {
		log.Println("validating ", resource, userId)
		if !aee.IsAee(userId) {
			rpData = append(rpData,resourcePermission{200, 0, true})
		} else {
			rpData = append(rpData,resourcePermission{403, 0, false})
		}
	} else if resource == "/blog-scraper" {
		log.Println("validating ", resource, userId)
		if aee.IsAee(userId) {
	                rpData = append(rpData,resourcePermission{200, 0, true})
	        } else {
		        rpData = append(rpData,resourcePermission{403, 0, false})
	        }
	} else if resource == "/events" {
		var eventId int64
		if method != "POST" {
			eventId = resourceIdArray[0]
		}
		log.Println("validating ", resource, userId, eventId, method)
		if method == "POST" || method == "PATCH" {
			if aee.IsAee(userId) {
				rpData = append(rpData,resourcePermission{200, eventId, true})
			} else {
				rpData = append(rpData,resourcePermission{403, eventId, false})
			}
		} else if method == "GET" {
			rpData = append(rpData,resourcePermission{200, eventId, true})
		} else {
			rpData = append(rpData,resourcePermission{403, eventId, false})
		}
	} else if resource == "/devices" || resource == "/notifications" || resource == "/library" {
		log.Println("validating ", resource, userId)
		if userId == 0 {
			rpData = append(rpData,resourcePermission{403, 0, false})
		} else {
			rpData = append(rpData,resourcePermission{200, 0, true})
		}
	} else if resource == "/report" || resource == "/init" {
		rpData = append(rpData,resourcePermission{200, 0, true})
	} else if resource == "/user" {
		log.Println("validating ", resource, method, userId, validationType, userIdQP, resourceIdArray)

		if validationType == "NONE" {
			rpData = append(rpData,resourcePermission{200, 0, true})
		} else {

		if method == "POST" {
			if validationType == "PRELOGIN" && userId > 0 {
				rpData = append(rpData,resourcePermission{200, 0, true})
			} else if validationType == "POSTLOGIN" {
				if userIdQP > 0 {
					if aee.IsAee(userId) || userId == userIdQP {
						rpData = append(rpData,resourcePermission{200, userIdQP, true})
					} else {
						rpData = append(rpData,resourcePermission{403, userIdQP, false})
					}
				} else {
					if userId > 0 {
						rpData = append(rpData,resourcePermission{200, userId, true})
					} else {
						rpData = append(rpData,resourcePermission{403, 0, false})
					}
				}
			} else {
				rpData = append(rpData,resourcePermission{200, 0, true})
			}
		} else if method == "GET" {
			if len(resourceIdArray) > 0  && resourceIdArray[0] > 0 {
				if aee.IsAee(userId) {
					rpData = append(rpData,resourcePermission{200, 0, true})
				} else {
					rpData = append(rpData,resourcePermission{403, 0, false})
				}
			} else {
				rpData = append(rpData,resourcePermission{200, 0, true})
			}
		} else if method == "PATCH" {
			if userIdQP > 0 {
				if aee.IsAee(userId) || userId == userIdQP {
					rpData = append(rpData,resourcePermission{200, userIdQP, true})
                                } else {
                                        rpData = append(rpData,resourcePermission{403, userIdQP, false})
				}
			} else {
				if userId > 0 {
                                        rpData = append(rpData,resourcePermission{200, userId, true})
                                } else {
                                        rpData = append(rpData,resourcePermission{403, userId, false})
				}
			}
		}
		}
	} else if resource == "/admins/users" {
		log.Println("validating ", resource, userId, method)
		if method == "DELETE" && aee.IsAee(userId) {
			rpData = append(rpData,resourcePermission{200, userId, true})
		} else {
			rpData = append(rpData,resourcePermission{403, userId, false})
		}
	} else if resource == "/oasis" {
		// if userId > 0 {
			 rpData = append(rpData,resourcePermission{200, 0, true})
		// } else {
			// rpData = append(rpData,resourcePermission{403, 0, false})
		// }
	} else if resource == "/user_pratilipi/v2.0/user_pratilipis" {
		if userId > 0 {
			 rpData = append(rpData,resourcePermission{200, 0, true})
		} else {
			rpData = append(rpData,resourcePermission{403, 0, false})
		}
	} else if resource == "/blogs" {
		if method == "GET" {
			rpData = append(rpData,resourcePermission{200, 0, true})
		} else if method == "POST" {
			var hasAccess = aee.HasUserAccess(userId, language, "BLOG_POST_ADD")
			if hasAccess {
				 rpData = append(rpData,resourcePermission{200, 0, true})
			} else {
				rpData = append(rpData,resourcePermission{403, 0, false})
			}
		} else if method == "PATCH" {
			var hasAccess = aee.HasUserAccess(userId, language, "BLOG_POST_UPDATE")
			if hasAccess {
				rpData = append(rpData,resourcePermission{200, 0, true})
			} else {
				rpData = append(rpData,resourcePermission{403, 0, false})
			}
		} else {
			rpData = append(rpData,resourcePermission{403, 0, false})
		}
	} else if resource == "/content" {
		if method == "GET" {
			rpData = append(rpData,resourcePermission{200, 0, true})
		} else {
			if userId > 0 {
				rpData = append(rpData,resourcePermission{200, 0, true})
			} else {
				rpData = append(rpData,resourcePermission{403, 0, false})
			}
		}
	} else {
		rpData = append(rpData,resourcePermission{403, 0, false})
	}

	//resource, method, data
	responseBodyObject := &responseBody{
		c.Get("originalResource").(string),
		c.Get("originalMethod").(string),
		rpData,
	}

	log.Println("After validating the resource",responseBodyObject)
	c.Response().Header().Set("User-Id",strconv.FormatInt(userId,10))
	return c.JSON(http.StatusOK, responseBodyObject)
}

func DeleteToken(c echo.Context) error {
	log.Println("Delete access token ")

	var accessToken string
	type message struct {
		Message string `json:"message"`
	}

	//Reading headers
	accessTokenArr := c.Request().Header["Access-Token"]
	if len(accessTokenArr) > 0 {
		accessToken = accessTokenArr[0]
	}

	if len(accessToken) > 0 {
		err := utils.DeleteCache(accessToken)
		if err != nil {
			log.Println("Error: While deleting the accessToken")
			return c.JSON(http.StatusInternalServerError, message{"Failed to delete the token"})
		}
		return c.JSON(http.StatusOK, message{"Successfully deleted the token"})
	} else {
		return c.JSON(http.StatusBadRequest, message{"Access-Token required"})
	}
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
		} else if strings.HasPrefix(resource,"/event-participate") {
			re := regexp.MustCompile("/[a-z0-9]{22}")
			resource = re.ReplaceAllString(resource, wildString)
		} else {
			re := regexp.MustCompile("/[0-9]+")
			resource = re.ReplaceAllString(resource, wildString)
		}

		log.Println(resource);

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
			resource == "/init/v1.0/init" || resource == "/init/v2.0/init" {
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
		} else if resource == "/event-participate/metadata/*" || 
			resource == "/event-participate/content/*" || 
			resource == "/event-participate/list" || 
			resource == "/event-participate/images" {
			resource = "/event-participate"
		} else if resource == "/user/register" || 
			resource == "/user/login" || 
			resource == "/user/login/facebook" || 
			resource == "/user/login/google" || 
			resource == "/users/v2.0/identifiers/is-valid" || 
			resource == "/users/v2.0/sessions/login" || 
			resource == "/users/v2.0/sessions/signup"  {
			resource = "/user"
			validationType = "PRELOGIN"
		} else if resource == "/user/email" || 
			resource == "/user/passwordupdate" || 
			resource == "/user/verification" || 
			resource == "/users/v2.0/passwords/forgot/intent" || 
			resource == "/users/v2.0/passwords/reset" {
			resource = "/user"
			validationType = "NONE"
		} else if resource == "/user" || 
			resource == "/user/logout" || 
			resource == "/user/firebase-token" || 
			resource == "/users/v2.0/sessions/logout" {
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
		} else if resource == "/oasis/v1.0/pratilipis/summary" {
			resource = "/pratilipis"
		} else if resource == "/recommendations/v2.0/pratilipis" || 
			resource == "/recommendations/v2.1/pratilipis" {
			resource = "/recommendation/pratilipis"
		} else if resource == "/oasis/v1.0/user_pratilipis/history" || 
			resource == "/user_pratilipi/v2.0/user_pratilipis/history/*" {
			resource = "/user_pratilipi/v2.0/user_pratilipis"
		} else if resource == "/oasis/blogs/v1.0" || 
			resource == "/oasis/blogs/v1.0/list" || 
			resource == "/oasis/author-interviews/v1.0" || 
			resource == "/oasis/author-interviews/v1.0/list" || 
			resource == "/blogs/v1.0" || 
			resource == "/blogs/v1.0/list" || 
                        resource == "/author-interviews/v1.0" || 
                        resource == "/author-interviews/v1.0/list" {
			resource = "/blogs"
		} else if resource == "/content/v1.0/contents/clipped" {
			resource = "/content"
		} else if resource == "/oasis/v1.0/authors" {
			resource = "/authors"
		}

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

	type cache struct {
		Id int64 `json:"id"`
	}

	val, err := utils.GetCache(accessToken)
	if err != nil {
		log.Println("Error: Wile getting userId from cache so fallback to get from db")
	}

	if (val == nil) {
		log.Println("Get userId from db as not available in cache for accesstoken ", accessToken)
		val, err = utilServices.GetUserIdByAccessToken(accessToken)
		if err != nil {
			//panic(err)
			log.Println("Error: While reading from db")
			return 0, err
		}

		if val == nil {
			return 0, errors.New("AccessToken not found")
		}

		temp := &cache{val.(int64)}
		j, err := json.Marshal(temp)
		if err != nil {
			//panic(err)
			log.Println("Error: While jsonMarshal")
			return 0, err
		}

		log.Println("Add userId from db into cache for accesstoken & userId ", accessToken, j)
		// Insert into cache
		err = utils.SetCache(accessToken, string(j),259200)
		if err != nil {
			//handle error
			log.Println("Error: While adding to cache")
		}
		return val.(int64), nil
	} else {

		c := cache{}
		err = json.Unmarshal([]byte(val.(string)),&c)
		if err != nil {
			//panic(err)
			log.Println("Error: While json Unmarshal")
			return 0, nil
		}
		return c.Id,nil
	}
}

func getAuthorsForPratilipis(pratilipis []utilServices.Pratilipi) ([]utilServices.Author, error) {
	var idStr string
	for _,p := range pratilipis {
		idStr += strconv.FormatInt(p.AuthorId,10)+","
	}

	sz := len(idStr)
	if sz > 0 {
		idStr = idStr[:sz-1]
	}

	log.Println("In get authors for pratilipis - ", idStr)

	authors, err := utilServices.GetAuthors(idStr)
	if err != nil {
		log.Println("Error: While getting authors from author service")
		return []utilServices.Author{},err
	}

	return authors,nil

}

func isUserAuthorToPratilipi(userId, authorId int64) bool {

	authors, err := utilServices.GetAuthors(strconv.FormatInt(authorId,10))
	if err != nil {
		//panic(err)
		log.Println("Error: While getting author from author service")
		return false
	}

	if len(authors) == 0 {
		return false
	}

	if authors[0] == (utilServices.Author{}) {
		return false
	}

	if authors[0].UserId != userId {
		return false
	}

	return true
}
