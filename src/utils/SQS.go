package utils

import (
	"time"
	"log"
	"auth/src/config"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

func SQSInit() {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(config.SQS.Region)},
	)

	if err != nil {
		os.Exit(2)
	}

	svc := sqs.New(sess)

	ticker := time.NewTicker(time.Duration(config.SQS.PollIntervalSeconds) * time.Second)

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
		log.Println(result)
	}
}


