// Recommended Packages for this Lambda
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const AWSXRay = require('aws-xray-sdk-core');

// SNS to send messages to
const snsArn = process.env.SNSArn;

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    let signal = determineSignal(event);

    await sendToSNS({
        type: signal,
        originalPayload: event.detail
    });
}

function determineSignal(message) {
    const detail = message.detail;
    let type

    if (detail.intensity < 3 && detail.creature == "creature") {
        type = "observation";
    } else if (detail.intensity == 3 && detail.creature == "creature") {
        type = "rare-observation";
    } else if (detail.intensity == 2 && (detail.creature == "hazard" || detail.creature == "anomaly")) {
        type = "alert"
    } else if (detail.data !== undefined) {
        type = "dark-signal"
    } else {
        type = "observation";
    }

    return type;
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
