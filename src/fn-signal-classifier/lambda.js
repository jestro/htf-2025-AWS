// Recommended Packages for this Lambda
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const AWSXRay = require('aws-xray-sdk-core');
let jsonMessage;
let darkMessage = {type: "dark-signal", originalPayload: jsonMessage};
// SNS to send messages to
const snsArn = process.env.SNSArn;

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    // Determine if the message is a dark signal or not
    let signalType = determineSignal(event);

    const isDark = signalType === "dark-signal" || signalType === undefined || jsonMessage.detail.data != undefined;

    let messageToSend;

    if (!isDark) {
        // Create correct message
        messageToSend = jsonMessage;
    } else {
        // Create correct message
        darkMessage.originalPayload = jsonMessage;
        messageToSend = darkMessage;
    }
    console.log("message to send")
    // Send to SNS
    await sendToSNS(messageToSend);
}

function determineSignal(message) {
    // Return the correct signal-type
    jsonMessage = message;
    const signalType = jsonMessage.detail.type;
    console.log("SignalType: ", signalType);
    return signalType;
}

async function sendToSNS(message) {
    console.log(message);

    // Client to be used
    const snsClient = AWSXRay.captureAWSv3Client(new SNSClient());

    // Setup parameters for SNS
    const params = {
        TopicArn: snsArn,
        Message: JSON.stringify(message),
    };

    try {
        const response = await snsClient.send(new PublishCommand(params));
        console.log(response);
    } catch (err) {
        console.error("Error sending message:", err);
    }
}
