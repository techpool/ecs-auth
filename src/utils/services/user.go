package services

import (
	"io/ioutil"
	"encoding/json"
	"log"

	config "auth/src/config"
	utils "auth/src/utils"
)

type AccessToken struct {
	Id string `json:"id"`
	UserId int64 `json:"userId"`
}

func GetUserIdByAccessToken (accessToken string) (interface{}, error) {

	headers := map[string] string{
		"Access-Token" : accessToken,
	}
	log.Println("get from author service: ",config.Endpoints["user"]+"/v2.0/access-tokens/get-userid")
	resp, err := utils.HttpGet(config.Endpoints["user"]+"/v2.0/access-tokens/get-userid", headers)
        if err != nil {
		log.Println("Error: While getting accesstoken ")
                panic(err)
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
		log.Println("Error: While parsing response body")
                panic(err)
        }

        at := AccessToken{}
        err = json.Unmarshal(body,&at)
	if err != nil {
		panic(err)
		log.Println("Error: While json unmarshall")
	}

	if (at == AccessToken{}) {
		return nil, nil
	}
        return at.UserId, nil
}
