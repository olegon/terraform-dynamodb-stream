const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
    region: "sa-east-1"
});

exports.lambda_handler = async function (event, context) {
    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
    const batchItemFailures = [];

    for (const record of event.Records) {
        console.log('Record: %o', record);

        const { messageId, body } = record;

        try {
            const eventPayload = JSON.parse(body);

            await evaluateEvent(eventPayload);
        } catch (error) {
            console.error(error);

            batchItemFailures.push({
                itemIdentifier: messageId
            });
        }
    }

    const result = {
        batchItemFailures
    };

    console.log('Result: %o', result);

    return result;
}

async function evaluateEvent(eventPayload) {
    const { correlationId, eventType } = eventPayload;
    
    const record = await getRecord(correlationId);

    console.log('Current record: %o', record);

    if (record == null) {
        await insertRecord(correlationId, eventType, eventPayload);
    }
    else {
        await updateRecord(record, eventType, eventPayload);
    }
}

async function getRecord(correlationId) {
    const command = new GetItemCommand({
        TableName: "app-events-registry",
        Key: {
            "pk": {
                "S": `events#${correlationId}`
            }
        }
    });

    const result = await client.send(command);

    console.log('Get item command: %o', command);
    console.log('Get item result: %o', result);

    return result.Item;
}

async function insertRecord(correlationId, eventName, eventPayload) {
    const command = new PutItemCommand({
        TableName: "app-events-registry",
        Item: {
            "pk": {
                "S": `events#${correlationId}`
            },
            [eventName]: {
                "S": JSON.stringify(eventPayload)
            },
            "ttl": {
                "N": expiresIn(3600).toString()
            },
            "version": {
                "N": "1"
            }
        },
        ConditionExpression: "attribute_not_exists(#version)",
        ExpressionAttributeNames: {
            "#version": "version"
        }
    });

    const result = await client.send(command);

    console.log('Insert item command: %o', command);
    console.log('Insert item result: %o', result);
}

async function updateRecord(record, eventName, eventPayload) {
    const currentVersion = parseInt(record.version.N, 10);

    const command = new UpdateItemCommand({
        TableName: "app-events-registry",
        Key: {
            "pk": record.pk
        },
        UpdateExpression: "SET #eventName = :eventPayload, #ttl = :ttl, #version = :nextVersion",
        ConditionExpression: "#version = :currentVersion",
        ExpressionAttributeNames: {
            "#eventName": eventName,
            "#version": "version",
            "#ttl": "ttl"
        },
        ExpressionAttributeValues: {
            ":currentVersion": {
                "N": currentVersion.toString()
            },
            ":nextVersion": {
                "N": (currentVersion + 1).toString()
            },
            ":eventPayload": {
                "S": JSON.stringify(eventPayload)
            },
            ":ttl": {
                "N": expiresIn(3600).toString()
            }
        }
    });

    const result = await client.send(command);

    console.log('Update item command: %o', command);
    console.log('Update item result: %o', result);
}

function expiresIn(afterSeconds = 60) {
    return ~~(new Date() / 1000) + afterSeconds;
}