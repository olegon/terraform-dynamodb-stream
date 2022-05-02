const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const client = new SQSClient({
    region: "sa-east-1"
});

(async () => {
    for (let i = 0; i < 1; i++) {
        const firstEventId = generateRandomId();
        const secondEventId = generateRandomId();

        await publish(firstEventId, "eventA");
        await publish(secondEventId, "eventA");
        await publish(firstEventId, "eventB");
    }
})();

async function publish(correlationId, eventType) {
    const eventPayload = {
        correlationId,
        eventType
    };

    const command = new SendMessageCommand({
        QueueUrl: 'https://sqs.sa-east-1.amazonaws.com/105029661252/app-events',
        MessageBody: JSON.stringify(eventPayload)
    });

    const result = await client.send(command);

    console.log('EventPayload: %o', eventPayload);
    console.log('Result: %o', result);
}

function generateRandomId() {
    return ~~(Math.random() * 1_000_000);
}