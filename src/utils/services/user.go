package services

import (
	"io/ioutil"
	"encoding/json"
	//"fmt"

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

	resp, err := utils.HttpGet(config.Endpoints["user"]+"/v2.0/access-tokens/get-userid", headers)
        if err != nil {
                panic(err)
		return nil, err
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                panic(err)
		return nil, err
        }

        at := AccessToken{}
        err = json.Unmarshal(body,&at)
	if err != nil {
		panic(err)
	}

	if (at == AccessToken{}) {
		return nil, nil
	}
        return at.UserId, nil
}
