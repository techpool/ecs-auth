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

type ReviewData struct {
        Data []Review `json:"data"`
}

func GetReviews(idStr string, userId int64) ([]Review, error) {
	var reviews []Review
	headers := map[string] string {
                "User-Id" : strconv.FormatInt(userId, 10),
        }
	log.Println("get from review service: ",config.Endpoints["social"]+"/v2.0/reviews?id="+idStr)
	resp, err := utils.HttpGet(config.Endpoints["social"]+"/v2.0/reviews?id="+idStr, headers)
	if err != nil {
                //handle error
		log.Println("Error: While getting reviews ")
		//panic(err)
		return reviews,err
        } else {
		defer resp.Body.Close()
        }

	body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
		log.Println("Error: While parsing review body")
		//panic(err)
		return reviews,err
	}
	var reviewData ReviewData
	json.Unmarshal(body,&reviewData)
        return reviewData.Data, nil

}
