package main

import (
	"log"
/*
	"os"

	"auth/src/config"
	"auth/src/resources"
	"auth/src/utils"
*/
)

func test () {
/*
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
	utils.SQSInit()
*/
	log.Println("Worker has started")
}
