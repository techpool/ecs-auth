package services

import (
	"io/ioutil"
	"encoding/json"
	"log"

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
	var pratilipis []Pratilipi
	headers := map[string] string{
                "Access-Token" : accessToken,
        }
	log.Println("get from author service: ",config.Endpoints["pratilipi"]+"/metadata?id="+idStr)
	resp, err := utils.HttpGet(config.Endpoints["pratilipi"]+"/metadata?id="+idStr, headers)
	if err != nil {
                //handle error
		log.Println("Error: While getting pratilipis")
		//panic(err)
		return pratilipis, err
        } else {
		defer resp.Body.Close()
	}

	body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
		log.Println("Error: While parsing pratilipis ")
		//panic(err)
		return pratilipis, err
	}

	json.Unmarshal(body,&pratilipis)
        return pratilipis, nil

}

func GetPratilipisBySlug(slug, accessToken string) ([]Pratilipi,error) {
	var pratilipis []Pratilipi
	headers := map[string] string{
                "Access-Token" : accessToken,
        }
	log.Println("get from author service: ",config.Endpoints["pratilipi"]+"/metadata?slug="+slug)
	resp, err := utils.HttpGet(config.Endpoints["pratilipi"]+"/metadata?slug="+slug, headers)
	if err != nil {
                log.Println("Error: While getting pratilipis by slug")
		//panic(err)
		return pratilipis, err
        } else {
		defer resp.Body.Close()
        }

	body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                log.Println("Error: While reading response from body + pratilipis + slug")
		//panic(err)
		return pratilipis, err
	}

	json.Unmarshal(body,&pratilipis)
        return pratilipis, nil
}
