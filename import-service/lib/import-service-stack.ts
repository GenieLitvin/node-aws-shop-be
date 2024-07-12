import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { S3EventSourceV2 } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      'catalogItemsQueue',
      'arn:aws:sqs:eu-west-1:128706803547:ProductServiseStack-catalogItemsQueue79451959-MwCvEo7dwg7F',
    );

    const environment = {
      BUCKET_NAME: 'node-aws-shop-be-upload',
      SQS_URL: catalogItemsQueue.queueUrl,
      LAMBDA_AUTH_NAME:
        'AuthorizationServiceStack-authorizationFnFB5C6175-LcUoFekEXrhF',
    };

    const bucket = s3.Bucket.fromBucketName(
      this,
      'ProductsImportBucket',
      environment.BUCKET_NAME,
    );

    const importProductsFile = new lambda.Function(
      this,
      'importProductsFileFn',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('dist'),
        handler: 'importProductsFile.handler',
        environment,
      },
    );
    bucket.grantReadWrite(importProductsFile);

    const api = new apigateway.LambdaRestApi(this, 'ProductsImportApi', {
      handler: importProductsFile,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS, // ALLOW GET, POST, PUT, DELETE, etc.
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Lambda authorizer
    const authorizationFn = lambda.Function.fromFunctionName(
      this,
      'authorizationFn',
      environment.LAMBDA_AUTH_NAME,
    );

    // Authorizer
    const authorizer = new apigateway.TokenAuthorizer(
      this,
      'importAuthorizer',
      {
        handler: authorizationFn,
      },
    );

    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', undefined, {
      methodResponses: [
        { statusCode: '200' },
        {
          statusCode: '401',
          responseModels: { 'application/json': apigateway.Model.EMPTY_MODEL },
        },
        {
          statusCode: '403',
          responseModels: { 'application/json': apigateway.Model.EMPTY_MODEL },
        },
        {
          statusCode: '500',
          responseModels: { 'application/json': apigateway.Model.EMPTY_MODEL },
        },
      ],
      requestParameters: {
        'method.request.querystring.name': true,
      },
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const importFileParser = new lambda.Function(this, 'importFileParserFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'importFileParser.handler',
      environment,
    });

    const eventS3 = new S3EventSourceV2(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: 'uploaded/' }],
    });
    importFileParser.addEventSource(eventS3);
    bucket.grantReadWrite(importFileParser);

    // Policy to send data to SQS
    const sqsPolicy = new iam.PolicyStatement({
      actions: ['sqs:SendMessage'],
      resources: [catalogItemsQueue.queueArn],
    });
    importFileParser.addToRolePolicy(sqsPolicy);

    const respParameters = {
      'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
      'gatewayresponse.header.Access-Control-Allow-Headers':
        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      'gatewayresponse.header.Access-Control-Allow-Methods':
        "'GET,OPTIONS,POST,PUT,DELETE'",
    };
    // Add GatewayResponses for 401 and 403 errors with CORS headers
    new apigateway.CfnGatewayResponse(this, 'UnauthorizedResponse', {
      restApiId: api.restApiId,
      responseType: 'UNAUTHORIZED',
      statusCode: '401',
      responseParameters: respParameters,
      responseTemplates: {
        'application/json': '{"message": "Unauthorized"}',
      },
    });

    new apigateway.CfnGatewayResponse(this, 'AccessDeniedResponse', {
      restApiId: api.restApiId,
      responseType: 'ACCESS_DENIED',
      statusCode: '403',
      responseParameters: respParameters,
      responseTemplates: {
        'application/json': '{"message": "Access Denied"}',
      },
    });

    new apigateway.CfnGatewayResponse(this, 'UnauthorizedResponseError', {
      restApiId: api.restApiId,
      responseType: 'DEFAULT_5XX',
      statusCode: '500',
      responseParameters: respParameters,
      responseTemplates: {
        'application/json': '{"message": "ServerError"}',
      },
    });
  }
}
