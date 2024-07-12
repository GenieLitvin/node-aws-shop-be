import {
  Context,
  Callback,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

export const handler = (
  event: APIGatewayTokenAuthorizerEvent,
  ctx: Context,
  cb: Callback<APIGatewayAuthorizerResult>,
) => {
  try {
    if (event['type'] !== 'TOKEN') {
      return cb(null, generatePolicy('user', event.methodArn, 'Deny', 401));
    }

    const authToken = event.authorizationToken; //'Basic sGLzdRxvZmw0ZXs0UGFzcw=='

    if (!authToken) {
      return cb(null, generatePolicy('user', event.methodArn, 'Deny', 401));
    }

    const encodedCreds = authToken.split(' ')[1]; //sGLzdRxvZmw0ZXs0UGFzcw==
    if (!encodedCreds) {
      return cb(
        null,
        generatePolicy(encodedCreds, event.methodArn, 'Deny', 401),
      );
    }

    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0];
    const password = plainCreds[1];
    const storedUserPassord = process.env[username];

    if (!storedUserPassord || storedUserPassord !== password) {
      return cb(
        null,
        generatePolicy(encodedCreds, event.methodArn, 'Deny', 403),
      );
    }

    const policy = generatePolicy(encodedCreds, event.methodArn, 'Allow', 200);

    cb(null, policy);
  } catch (err) {
    console.log('MyError:', err);
    cb('Error');
  }
};

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: 'Allow' | 'Deny',
  statusCode?: number,
): APIGatewayAuthorizerResult => {
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
    context: {
      statusCode: statusCode,
    },
  };
};
