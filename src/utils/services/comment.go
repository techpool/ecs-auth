package services

import (
        "io/ioutil"
        "encoding/json"
		"strconv"
		"log"

        config "auth/src/config"
        utils "auth/src/utils"
)

type User struct {
        Id int64 `json:"id"`
}

type Comment struct {
        Id int64 `json:"id"`
        ReferenceType string `json:"referenceType"`
        ReferenceId int64 `json:"referenceId"`
        State string `json:"state"`
        User User `json:user`
}

type Temp struct {
	Data []Comment `json:"data"`
}

func GetComments(idStr string, userId int64) ([]Comment, error) {
	var comments []Comment
        headers := map[string] string{
                "User-Id" : strconv.FormatInt(userId, 10),
        }
	log.Println("get from comment service: ",config.Endpoints["social"]+"/v2.0/comments?id="+idStr)
	resp, err := utils.HttpGet(config.Endpoints["social"]+"/v2.0/comments?id="+idStr, headers)
        if err != nil {
                //handle error
		log.Println("Error: While getting comments")
		//panic(err)
		return comments, err
	} else {
		defer resp.Body.Close()
        }

	body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
		log.Println("Error: While parsing comments body")
		//panic(err)
		return comments, err
	}

	var temp Temp
	json.Unmarshal(body,&temp)
	return temp.Data, nil

}

