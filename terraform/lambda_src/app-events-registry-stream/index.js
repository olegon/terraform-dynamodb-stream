exports.lambda_handler = async function(event, context) {
    for (const record of event.Records) {
        const { eventName, dynamodb } = record;
           
        console.log("Event name: %s", eventName);
        console.log("Object: %o", dynamodb);

        if (eventName === 'MODIFY') {
            console.log('Record modified.');

            const { NewImage, OldImage } = dynamodb; 
            analyzeRegister(NewImage);
        }
        else {
            console.warn('Ignored event: %s', eventName)
        }
    }
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