package services

import (
	"io/ioutil"
	"encoding/json"

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
	resp, err := utils.HttpGet(config.Endpoints["author"]+"/meta_data?id="+idStr, headers)
	if err != nil {
		//handle error
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		//handle error
	}
	var authors []Author
	json.Unmarshal(body,&authors)
	return authors, nil
}

func GetAuthorsBySlug(slugs string) ([]Author, error) {
	var headers map[string]string
	resp, err := utils.HttpGet(config.Endpoints["author"]+"/meta_data?slug="+slugs, headers)
	if err != nil {
                //handle error
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
        }

        var authors []Author
        json.Unmarshal(body,&authors)
        return authors, nil
}
