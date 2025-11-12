// Recommended Packages for this Lambda
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { Client } = require("@opensearch-project/opensearch");
const { AwsSigv4Signer } = require("@opensearch-project/opensearch/aws");
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

const openSearchEndpoint = "https://s6tkjpxuugo2q82i4z3d.eu-central-1.aoss.amazonaws.com";

const osClient = new Client({
    ...AwsSigv4Signer({
        region: "eu-central-1",
        service: 'aoss', // 'es' for managed, 'aoss' for serverless
        getCredentials: defaultProvider(),
    }),
    node: openSearchEndpoint,
});

const dynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient());

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    const message = JSON.parse(event.Records[0].Sns.Message);
    const timestamp = event.Records[0].Sns.Timestamp;
    const snsMessageId = event.Records[0].Sns.MessageId;

    switch (message.type) {
        case "observation":
        case "rare-observation":
            await insertIntoDynamoDB(message, timestamp, snsMessageId);
            break;
        case "alert":
            await insertIntoOpenSearch(message, timestamp, snsMessageId)
    }
}

async function insertIntoDynamoDB(message, timestamp, snsMessageId) {
    const params = {
        TableName: "HTF25-SecurityMobistar-Challenge2DynamoDB-HJYKMV5FHE25",
        Item: {
            id: snsMessageId,
            team: "htf-securitymobistar",
            species: message.originalPayload.species,
            location: message.originalPayload.location,
            intensity: message.originalPayload.intensity,
            timestamp: timestamp,
            type: message.originalPayload.type
        }
    }

    try {
        const response = await dynamoClient.send(new PutCommand(params));
        console.log("✅ Item inserted successfully:", response);
    } catch (error) {
        console.error("❌ Error inserting item:", error);
    }
}

async function insertIntoOpenSearch(message, timestamp, snsMessageId) {
    const params = {
        index: "securitymobistar",
        body: {
            id: snsMessageId,
            team: "htf-securitymobistar",
            species: message.originalPayload.species,
            location: message.originalPayload.location,
            intensity: message.originalPayload.intensity,
            timestamp: timestamp,
            type: message.originalPayload.type
        }
    }

    try {
        const response = await osClient.index(params)
        console.log("✅ Index inserted:", response);
    } catch (error) {
        console.error("❌ Error inserting index:", error);
    }
}
