**IsAuthorized**
----
  This api is to check if the current user has permission to perform the requested action on the specified resource.

* **URL**
  /auth/isAuthorized?resource=&action=

* **Method:**
  GET

*  **Headers**
    AccessToken

*  **Query Params**
    
    | Field      | Description                                                    | Optional   |
    | ---------- | -------------------------------------------------------------- | ---------- |
    | resource   | URL encoded URI (eg: %2Fpratilipi)    | yes        |
    | action | It can be create, update, delete or read        | yes        |
    

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

* **URL**
  /auth/hasAccess?resource=&id=

* **Method:**
  GET

*  **Headers**
    User-Id

*  **Query Params**
    
    | Field      | Description                                                    | Optional   |
    | ---------- | -------------------------------------------------------------- | ---------- |
    | resource   | The resource type (eg: pratilipi/author)    | yes        |
    | id | comma seperated resource ids        | yes        |
    

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