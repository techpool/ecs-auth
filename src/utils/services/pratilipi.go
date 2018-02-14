package services

import (
	"io/ioutil"
	"encoding/json"

	config "auth/src/config"
	utils "auth/src/utils"
)

type Pratilipi struct {
	PratilipiId int64
	Language string
	AuthorId int64
	State string
}

func GetPratilipis(idStr, accessToken string) ([]Pratilipi,error) {
	var headers map[string]string
	resp, err := utils.HttpGet(config.Endpoints["pratilipi"]+"/metadata?id="+idStr, headers)
	if err != nil {
                //handle error
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
        }
	var pratilipis []Pratilipi
	json.Unmarshal(body,&pratilipis)
        return pratilipis, nil

}

func GetPratilipisBySlug(slug, accessToken string) ([]Pratilipi,error) {
	var headers map[string]string
	resp, err := utils.HttpGet(config.Endpoints["pratilipi"]+"/metadata?slug="+slug, headers)
        if err != nil {
                //handle error
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
        }
	var pratilipis []Pratilipi
	json.Unmarshal(body,&pratilipis)
        return pratilipis, nil
}
