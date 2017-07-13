**IsAuthorized**
----
  This api is to check if the current user has permission to perform the requested action on the specified resource.

* **URL**  
  /auth/isAuthorized?resource=&method=&id= 
  
  Example:  
  ```
  /auth/isAuthorized?resource=%2Fpratilipis&method=GET&id=23452353245235,1234236547865,69785476456746
   ```

* **Method:**
  GET

* **Headers:**  
    Access-Token (Requests coming from PAG)  
    User-Id (Requests coming from internal services)

* **Query Params**
    
    | Field      | Description                                                    | Required   |
    | ---------- | -------------------------------------------------------------- | ---------- |
    | resource   | URL encoded URI (eg: %2Fpratilipi)    | Yes        |
    | method | The HTTP method        | Yes        |
    | id	| The resource id, multiple comma seperated ids are accepeted	| Yes	|
    
  For certain cases, few additional parameters are required to validate authorization.

* **Response Headers**  
  User-Id (Adds User-Id to the response header, on requests from PAG).

* **Success Response:**
  * **Code:** 200 
    ~~~
	{
		"resource": "/pratilipis",
		"method": "GET",
		"data": [
	        {
	        	"code":200,
	          	"id":523523549343,
	            	"isAuthorized": true
	        },
	        {
		        "code": 401,
	          	"id":93309245319,
	            	"isAuthorized": false
	        },
	        {
		        "code": 403,
	          	"id":73284523450,
	            	"isAuthorized": false
	        },
	        {
		        "code": 404,
	          	"id":0000,
	            	"isAuthorized": false
	        }
		]
	}
    ~~~
    
* **Error Response:**
  * **Code:** 400  
  ~~~
  {
  	"message": "Invalid parameters"
  }
  ~~~
 
    OR
 
  * **Code:** 500 INTERNAL SERVER ERROR  

	OR

  * **Code:** 502 BAD GATEWAY  
