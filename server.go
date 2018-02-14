package main

import (
	"fmt"
	"os"
	"net/http"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"

	"auth/src/controllers"
	"auth/src/config"
	"auth/src/resources"
	"auth/src/utils"
)

func main () {
	app := echo.New()

	stage := os.Getenv("STAGE")
	if len(stage) == 0 {
		fmt.Println("Stage variable is not set")
	}

	apiEndpoint := os.Getenv("API_END_POINT")
	if len(apiEndpoint) == 0 {
		fmt.Println("Api endpoint variable is not set")	
	}


	//Middleware
	app.Use(middleware.Logger())

	//Load config
	config.Init(stage, apiEndpoint)

	//Initialize resource
	err := resources.Init()
	if err != nil {
		panic(err)
	}
	defer resources.Terminate()

	//Initialise utils
	utils.Init()

	//Initialize routes
	controllers.Init(app)

	//Health API
	app.GET("/health",func(c echo.Context) error {
		return c.String(http.StatusOK, "healthy")
	})

	fmt.Println("Starting the server..")
	app.Logger.Fatal(app.Start(":"+config.Server.Port))
}
