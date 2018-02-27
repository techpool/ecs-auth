package config

import (
	"gopkg.in/ini.v1"
	//"path/filepath"
	//"runtime"
	"log"
	"os"
	"fmt"
	"strconv"
)

var Server struct {
	Port string
}

var Redis struct {
	Host string
	TTL int32
	DB int
}

var Endpoints map[string] string
var config *ini.File
var err error

func Init (stage , apiEndpoint string) {

	log.Println("Loading the config..")

	if stage == "local" {
		Server.Port = "8080"
		Redis.Host = "localhost:8080"
		Redis.DB = 3
	} else {
		redisEndpoint := os.Getenv("MASTER_REDIS_ENDPOINT")
		redisPort := os.Getenv("MASTER_REDIS_PORT")
		redisDB := os.Getenv("MASTER_REDIS_DB")
		redisHost := fmt.Sprintf("%s:%d",redisEndpoint,redisPort)

		Server.Port = "8080"
		Redis.Host = redisHost
		Redis.DB, _  = strconv.Atoi(redisDB)
	}

	Endpoints = make(map[string] string)
	Endpoints["social"] = apiEndpoint+"/social"
	Endpoints["user"] = apiEndpoint+"/users"
	Endpoints["author"] = apiEndpoint+"/authors"
	Endpoints["pratilipi"] = apiEndpoint+"/pratilipis"
}

