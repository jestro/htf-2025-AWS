// Recommended Packages for this Lambda
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const AWSXRay = require('aws-xray-sdk-core');
let JsonMessage = {id: "event-uuid", "detail-type": "creature | hazard | anomaly | dark-signal", source: "htf-2025-aquatopia.sonar-generator", detail: {type: "creature | hazard | anomaly", species: "Sea Turtle", location: "reef-2", intensity: 1}}
// SNS to send messages to
const snsArn = process.env.SNSArn;

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    // Determine if the message is a dark signal or not
    let isDark;

    let messageToSend;

    if (!isDark) {
        // Create correct message
        messageToSend = null;
    } else {
        // Create correct message
        messageToSend = null;
    }

    console.log(JSON.stringify(messageToSend))
    // Send to SNS
}

function determineSignal(message) {
    // Return the correct signal-type
    JsonMessage = JSON.parse(message);
    const signalType = JsonMessage.detail.type;
    return;
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
