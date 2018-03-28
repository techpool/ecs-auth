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
	message string
}

type Message struct {
	version string
	meta Meta
	name string
	event string
}

type Meta struct {
	resourceType string
	resourceID string
	serviceID string
	serviceVersion string
}

func SQSInit() {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(config.SQS.Region)},
	)

	if err != nil {
		os.Exit(2)
	}

	svc := sqs.New(sess)

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
		log.Println("The SQS Message: ",sqsMsg)
		log.Println("The SQS Message Body: ",*sqsMsg.Body)
		log.Println("The Bytes of SQS Message Body: ",[]byte(*sqsMsg.Body))
		if err := json.Unmarshal([]byte(*sqsMsg.Body),&sqsMessage); err != nil {
			log.Println("Error while unmarshaling error ",err)
		}
		var message Message
		if err := json.Unmarshal([]byte(sqsMessage.message),&message); err != nil {
			log.Println("Error while unmarshalling 2 error", err)
		}

		log.Println(message)
	}
}

