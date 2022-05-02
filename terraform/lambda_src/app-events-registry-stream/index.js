exports.lambda_handler = async function(event, context) {
    for (const record of event.Records) {
        const { eventName, dynamodb } = record;
        const { NewImage, OldImage } = dynamodb;    

        console.log("Event name: %s", eventName);
        console.log("Object: %o", dynamodb);

        if (isExpiredByTTL(record)) {
            console.log('Record removed by TTL.');
        }
        else if (eventName === 'REMOVE') {
            console.log('Record removed.');
        }
        else if (eventName === 'INSERT') {
            console.log('Record inserted.');
            analyzeRegister(NewImage);
        }
        else if (eventName === 'MODIFY') {
            console.log('Record modified.');
            analyzeRegister(NewImage);
        }
        else {
            console.warn('Unknow event: %s', eventName)
        }
    }
}

function isExpiredByTTL(record) {
    const { eventName, userIdentity: { principalId, type } = { } } = record;

    return eventName === 'REMOVE' && principalId === 'dynamodb.amazonaws.com' && type === 'Service';
}

function analyzeRegister(register) {
    if (isFulfilled(register)) {
        console.log('Register fulfilled');
        // publish somewhere...
    }
    else {
        console.log('Register missing fields');
    }
}

function isFulfilled(register) {
    const { eventA, eventB } = register;

    return eventA != null && eventB != null;
}