package services

import (
	"io/ioutil"
        "encoding/json"
	"strconv"

        config "auth/src/config"
        utils "auth/src/utils"
)
/*
type User struct {
	Id int64 `json:"id"`
}
*/
type Review struct {
	Id int64 `json:"id"`
	ReferenceType string `json:"referenceType"`
	ReferenceId int64 `json:"referenceId"`
	State string `json:"state"`
	User User `json:user`
}

func GetReviews(idStr string, userId int64) ([]Review, error) {
	headers := map[string] string {
                "User-Id" : strconv.FormatInt(userId, 10),
        }
	resp, err := utils.HttpGet(config.Endpoints["social"]+"/v2.0/reviews?id="+idStr, headers)
	if err != nil {
                //handle error
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
        }
        var reviews []Review
        json.Unmarshal(body,&reviews)
        return reviews, nil

}
