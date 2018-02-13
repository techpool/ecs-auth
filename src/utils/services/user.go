package services

import (
	"io/ioutil"
	"encoding/json"

	config "auth/src/config"
	utils "auth/src/utils"
)

type AccessToken struct {
	id string
	userId int64
}

func GetUserIdByAccessToken (accessToken string) (interface{}, error) {

	headers := map[string] string{
		"Access-Token" : accessToken,
	}

	resp, err := utils.HttpGet(config.Endpoints["user"]+"/v2.0/access-tokens/get-userid", headers)
        if err != nil {
                //handle error
		return nil, err
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
		return nil, err
        }
        var at AccessToken
        json.Unmarshal(body,&at)
	if (at == AccessToken{}) {
		return nil, nil
	}
        return at.userId, nil
}
