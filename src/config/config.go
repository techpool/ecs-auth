package config

import (
	"gopkg.in/ini.v1"
	"path/filepath"
	"runtime"
	"log"
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

	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("No caller information")
	}

	filename = filepath.Join(filepath.Dir(filename), stage+".config.ini")

	config, err = ini.InsensitiveLoad(filename)
	if err != nil  {
		panic(err)
		return
	}

	// Load server config
	err = load("server",&Server)
	if err != nil {
		panic(err)
	}

	// Load redis config
	err = load("redis", &Redis)
	if err != nil {
		panic(err)
	}

	Endpoints = make(map[string] string)
	Endpoints["social"] = apiEndpoint+"/social"
	Endpoints["user"] = apiEndpoint+"/users"
	Endpoints["author"] = apiEndpoint+"/authors"
	Endpoints["pratilipi"] = apiEndpoint+"/pratilipis"
}

func load (section string, obj interface{}) error {
	return config.Section(section).MapTo(obj)
}
