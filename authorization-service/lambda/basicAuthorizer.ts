import { Context, Callback, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

export const handler = (
  event: APIGatewayTokenAuthorizerEvent,
  ctx: Context,
  cb: Callback,
) => {
  try {
    console.log('Event:', event);
    console.log('passw:', process.env.GenieLitvin);
    if (event['type'] != 'TOKEN') cb('Unauthorized!');
    const authToken = event.authorizationToken;

    const encodedCreds = authToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0];
    const password = plainCreds[1];
    const storedUserPassord = process.env[username];
    const effect =
      !storedUserPassord || storedUserPassord != password ? 'Deny' : 'Allow';
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    cb(null, policy);
  } catch (err) {
    cb('Error');
  }
};

const generatePolicy = (
  principalId: string,
  resource: string,
  effect = 'Allow',
) => {
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
