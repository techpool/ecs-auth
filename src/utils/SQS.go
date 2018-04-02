package utils

import (
	"time"
	"log"
	"auth/src/config"
	"os"
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

type SqsMessage struct {
	Message string
}

type Message struct {
	Version string
	Meta Meta
	Name string
	Event string
	Message InnerMessage
}

type Meta struct {
	ResourceType string
	ResourceID int64
	ServiceID string
	ServiceVersion string
}

type InnerMessage struct {
	AccessToken []string
}

var svc *sqs.SQS

func SQSInit() {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(config.SQS.Region)},
	)

	if err != nil {
		os.Exit(2)
	}

	svc = sqs.New(sess)
	receiveMessages()
}
func receiveMessages() {
	ticker := time.NewTicker(time.Duration(config.SQS.PollIntervalSeconds) * time.Second)
	log.Println(config.SQS.QueueURL)
	for _ = range ticker.C {
		result, err := svc.ReceiveMessage(&sqs.ReceiveMessageInput{
			AttributeNames: []*string{
				aws.String(sqs.MessageSystemAttributeNameSentTimestamp),
			},
			MessageAttributeNames: []*string{
				aws.String(sqs.QueueAttributeNameAll),
			},
			QueueUrl:            &config.SQS.QueueURL,
			MaxNumberOfMessages: aws.Int64(10),
			//VisibilityTimeout:   aws.Int64(36000),  // 10 hours
			//WaitTimeSeconds:     aws.Int64(0),
		})
		if (err != nil) {
			log.Println("Error while reading from queue ",err)
			ticker.Stop()
		}

		processMessages(result.Messages)
	}
}


func processMessages(sqsMessages []*sqs.Message) {
	for _,sqsMsg := range sqsMessages {
		var sqsMessage SqsMessage
		if err := json.Unmarshal([]byte(*sqsMsg.Body),&sqsMessage); err != nil {
			log.Println("Error while unmarshaling error ",err)
		}
		var message Message
		if err := json.Unmarshal([]byte(sqsMessage.Message),&message); err != nil {
			log.Println("Error while unmarshalling 2 error", err)
		}

		if message.Version == "2.0" && message.Event == "USER.DELETE" {
		//log.Println(message.Message.AccessToken)
			if len(message.Message.AccessToken) > 0 {
				for _,at := range message.Message.AccessToken {
					DeleteCache(at)
				}
			}
		}
		deleteMessage(sqsMsg.ReceiptHandle)
	}
}


func deleteMessage(receiptHandle *string) {
	_, err := svc.DeleteMessage(&sqs.DeleteMessageInput{
		QueueUrl:      &config.SQS.QueueURL,
		ReceiptHandle: receiptHandle,
	})

	if err != nil {
		log.Println("Delete Error", err)
	}

}
