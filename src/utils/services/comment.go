package services

import (
        "io/ioutil"
        "encoding/json"
	"strconv"

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

func GetComments(idStr string, userId int64) ([]Comment, error) {
        headers := map[string] string{
                "User-Id" : strconv.FormatInt(userId, 10),
        }
        resp, err := utils.HttpGet(config.Endpoints["social"]+"/v2.0/comments?id="+idStr, headers)
        if err != nil {
                //handle error
        }
        defer resp.Body.Close()
        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                //handle error
        }
        var comments []Comment
        json.Unmarshal(body,&comments)
        return comments, nil

}


