var AWS = require('aws-sdk'); 
var snsSqsConfig = require('../config/sns-sqs.js')[ process.env.STAGE || 'local' ];
var cacheUtil   = require('./cacheUtil');

// configure AWS
AWS.config.update({
  'region': snsSqsConfig.REGION
});

var sqs = new AWS.SQS();
var followService;

var receiveMessageParams = {
  QueueUrl: snsSqsConfig.QUEUE,
  MaxNumberOfMessages: 10
};



function getMessages() {
	console.log("reading msgs");
  sqs.receiveMessage(receiveMessageParams, receiveMessageCallback);
}

function receiveMessageCallback (err, data) {
	var message;
	var temp;
	var receiptHandle;
  if (data && data.Messages && data.Messages.length > 0) {
	    for (var i=0; i < data.Messages.length; i++) {
		      temp =  JSON.parse(data.Messages[i].Body);
		      message = JSON.parse(temp.Message);
		      receiptHandle = data.Messages[i].ReceiptHandle;
		      processMessage(message,receiptHandle); 
	    }
  } 
  
  if (err) {
	  console.log('Error while reading messages',err);
  }
}

function processMessage(message,receiptHandle) {
	console.log("Recivied the message, need to act on this..!!!",message, message.event, receiptHandle);
    if (message.event == 'USER.DELETE') {
    	var accessTokens = message.message.accessToken; 
    	for (var i=0; i < accessTokens.length; i++) {
    		cacheUtil.del(accessTokens[i]);
    	}
    	deleteMessage(receiptHandle);
    }
}

function deleteMessage(receiptHandle, index) {
	console.log("Deleteing msg with handle",receiptHandle);
	var deleteMessageParams = {
	    QueueUrl: snsSqsConfig.QUEUE
	};
	deleteMessageParams.ReceiptHandle = receiptHandle
	sqs.deleteMessage(deleteMessageParams, function(err, data) {
		if (err) {
			console.log('Error while deleting message',err);
		} 
			
	});
}


function SQS() {

}

SQS.prototype.init = function() {
	setInterval(getMessages, 15000);
}

module.exports = SQS;

