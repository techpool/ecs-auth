**IsAuthorized**
----
  This api is to check if the current user has permission to perform the requested action on the specified resource.

* **URL**  
  /auth/isAuthorized

* **Method:**  
  POST

* **Request Headers**  
  AccessToken (Requests coming from PAG)  
  User-Id (Requests coming from internal services)
    
*  **Request Body**
    ~~~
    {
	    "batch":[
          {"method":"GET", "resource":"/pratilipi", "id":5698028945},
          {"method":"GET", "resource":"/pratilipi", "id":9378459023},
          {"method":"GET", "resource":"/pratilipi", "id":9073094325}
	    ]
    }
    ~~~

* **Response Headers**  
  User-Id (Converts AccessToken to User-Id, on requests from PAG).

* **Success Response:**
  * **Code:** 200 
    ~~~
    {
        "data": [
        {
          "code": 200,
          "body": {
            "isAuthorized": true
           }
        },
        {
          "code": 401,
          "body": {
            "isAuthorized": true
           }
        },
        {
          "code": 403,
          "body": {
            "isAuthorized": false
          }
        }
      ]
    }
    ~~~
    
* **Error Response:**
  * **Code:** 500 INTERNAL SERVER ERROR  

    OR

  * **Code:** 502 BAD GATEWAY  