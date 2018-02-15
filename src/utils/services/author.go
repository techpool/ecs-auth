package services

import (
	"io/ioutil"
	"encoding/json"
	"log"

	config "auth/src/config"
	utils "auth/src/utils"
)

type Author struct {
	AuthorId int64 `json:"authorId"`
	UserId int64 `json:"userId"`
	Language string `json:"language"`
}

func GetAuthors(idStr string) ([]Author, error) {
	var headers map[string]string
	var authors []Author
    log.Println("get from author service: ",config.Endpoints["author"]+"/meta_data?id="+idStr)
	resp, err := utils.HttpGet(config.Endpoints["author"]+"/meta_data?id="+idStr, headers)
	if err != nil {
		log.Println("Error: While getting authors")
		panic(err)
	} else {
		defer resp.Body.Close()
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error: While parsing response body")
		panic(err)
	}

	json.Unmarshal(body,&authors)
	return authors, nil
}

func GetAuthorsBySlug(slugs string) ([]Author, error) {
	var headers map[string]string
	var authors []Author
	log.Println("get from author service: ",config.Endpoints["author"]+"/meta_data?slug="+slugs)
	resp, err := utils.HttpGet(config.Endpoints["author"]+"/meta_data?slug="+slugs, headers)
	if err != nil {
        log.Println("Error: While getting authors")
		panic(err)
	} else {
		defer resp.Body.Close()
	}

        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
        log.Println("Error: While parsing response body")
		panic(err)
	}

        json.Unmarshal(body,&authors)
        return authors, nil
}
