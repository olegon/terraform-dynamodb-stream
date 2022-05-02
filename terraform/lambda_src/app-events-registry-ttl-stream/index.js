exports.lambda_handler = async function(event, context) {
    for (const record of event.Records) {
        const { eventName, dynamodb } = record;
          

        console.log("Event name: %s", eventName);
        console.log("Object: %o", dynamodb);

        if (isExpiredByTTL(record)) {
            console.log('Record removed by TTL.');

            const { NewImage, OldImage } = dynamodb;  
            analyzeRegister(OldImage);
        }
        else {
            console.warn('Ignored event: %s', eventName)
        }
    }
}

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-streams.html
function isExpiredByTTL(record) {
    const { eventName, userIdentity: { principalId, type } = { } } = record;

    return eventName === 'REMOVE' && principalId === 'dynamodb.amazonaws.com' && type === 'Service';
}

function analyzeRegister(register) {
    if (isFulfilled(register)) {
        console.log('Ignoring register fulfilled');
    }
    else {
        console.log('Register not fulfilled expired');
        // publish somewhere...
    }
}

function isFulfilled(register) {
    const { eventA, eventB } = register;

    return eventA != null && eventB != null;
}