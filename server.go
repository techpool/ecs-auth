package main

import (
	"log"
	"os"
	"net/http"
	"time"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"

	"auth/src/controllers"
	"auth/src/config"
	"auth/src/resources"
	"auth/src/utils"
)

func main () {

	app := echo.New()
	app.Server.ReadTimeout = 15 * time.Second
	app.Server.WriteTimeout = 45 * time.Second

	stage := os.Getenv("STAGE")
	if len(stage) == 0 {
		log.Println("Stage variable is not set")
	}

	apiEndpoint := os.Getenv("API_END_POINT")
	if len(apiEndpoint) == 0 {
		log.Println("Api endpoint variable is not set")
	}


	//Middleware
	app.Use(middleware.Logger())

	//Load config
	config.Init(stage, apiEndpoint)

	//Initialize resource
	err := resources.Init()
	if err != nil {
//		panic(err)
		log.Println("Terminating the app as the resources are not loaded successfully")
		os.Exit(2)
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

	log.Println("Starting the server..")
	app.Logger.Fatal(app.Start(":"+config.Server.Port))
}
