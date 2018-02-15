package services

import (
	"io/ioutil"
        "encoding/json"
	"strconv"
	"log"

        config "auth/src/config"
        utils "auth/src/utils"
)

type Review struct {
	Id int64 `json:"id"`
	ReferenceType string `json:"referenceType"`
	ReferenceId int64 `json:"referenceId"`
	State string `json:"state"`
	User User `json:user`
}

func GetReviews(idStr string, userId int64) ([]Review, error) {
	var reviews []Review
	headers := map[string] string {
                "User-Id" : strconv.FormatInt(userId, 10),
        }
	log.Println("get from author service: ",config.Endpoints["social"]+"/v2.0/reviews?id="+idStr)
	resp, err := utils.HttpGet(config.Endpoints["social"]+"/v2.0/reviews?id="+idStr, headers)
	if err != nil {
                //handle error
		log.Println("Error while getting reviews ")
		panic(err)
        } else {
		defer resp.Body.Close()
        }

	body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
		log.Println("Error while parsing review body")
		panic(err)
	}

	json.Unmarshal(body,&reviews)
        return reviews, nil

}
