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

	runType := os.Args[1]

	log.Println("server has started", runType)

	stage := os.Getenv("STAGE")
	if len(stage) == 0 {
		log.Println("Stage variable is not set")
	}

	apiEndpoint := os.Getenv("API_END_POINT")
	if len(apiEndpoint) == 0 {
		log.Println("Api endpoint variable is not set")
	}

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

	if runType == "service" {
	app := echo.New()
        app.Server.ReadTimeout = 15 * time.Second
        app.Server.WriteTimeout = 45 * time.Second

	//Middleware
        app.Use(middleware.Logger())

	//Initialize routes
        controllers.Init(app)

	//Health API
	app.GET("/health",func(c echo.Context) error {
		return c.String(http.StatusOK, "healthy")
	})

	log.Println("Starting the server..")
	app.Logger.Fatal(app.Start(":"+config.Server.Port))
	} else if runType == "worker" {
		log.Println("Starting the worker..")
		utils.SQSInit()
	}

}

