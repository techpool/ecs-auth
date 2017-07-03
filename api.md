**IsAuthorized**
----
  This api is to check if the current user has permission to perform the requested action on the specified resource.

* **URL:**
  /auth/isAuthorized?resource=&id=&action=

    ***Example***
    ~~~
    /auth/isAuthorized?resource=%2Fpratilipi&id=89378594325&action=PATCH
    ~~~
* **Method:**
  GET

*  **Headers:**
    AccessToken

*  **Query Params**
    
    | Field      | Description                                                    | Required   |
    | ---------- | -------------------------------------------------------------- | ---------- |
    | `resource`   | URL encoded URI (eg: %2Fpratilipi)    | yes        |
    | `id`   | The unique identifier of resource    | optional        |
    | `action` | The HTTP method that client used to make the request        | yes        |
    

* **Success Response:**
  * **Code:** 200 
    ~~~
    {
        isAuthorized : true 
    }
    ~~~
* **Error Response:**
  * **Code:** 401 UNAUTHORIZED 
    ~~~
    {
        error : "Log in required" 
    }
    ~~~

    OR

  * **Code:** 403 FORBIDDEN 
    ~~~
    {
        error : "Not authorized" 
    }
    ~~~


**HasAccess**
----
  This api is to return the access permissions of logged in user for given set of resources.

* **URL:**
  /auth/hasAccess?resource=&id=
  
    ***Example***
    ~~~
        /auth/hasAccess?resource=pratilipi&id=12345,8903744,238979343
    ~~~

* **Method:**
  GET

*  **Headers:**
    User-Id

*  **Query Params**
    
    | Field      | Description                                                    | Required   |
    | ---------- | -------------------------------------------------------------- | ---------- |
    | `resource`   | The resource type (eg: pratilipi/author)    | yes        |
    | `id` | comma seperated resource ids        | yes        |
    

* **Success Response:**
  * **Code:** 200 
    ~~~
    { 
        pratilipis: [
            {
                id: 123456789,
                update: true
            },
            {
                id: 123456789,
                update: false
            },
            {
                id: 123456789,
                update: true
            }
        ] 
    }
    ~~~
* **Error Response:**
  * **Code:** 400 BAD REQUEST
    ~~~
    { 
        error : "Invalid parameters" 
    }
