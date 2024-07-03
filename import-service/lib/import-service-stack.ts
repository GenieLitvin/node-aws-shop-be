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
      'arn:aws:sqs:eu-west-1:128706803547:ProductServiseStack-catalogItemsQueue79451959-XDQn7PjRMmyR',
    );
    const environment = {
      BUCKET_NAME: 'node-aws-shop-be-upload1',
      SQS_URL: catalogItemsQueue.queueUrl,
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
        allowHeaders: ['Content-Type'],
      },
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', undefined, {
      methodResponses: [{ statusCode: '200' }],
      requestParameters: {
        'method.request.querystring.name': true,
      },
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

    //policy to send data to sqs
    const sqsPolicy = new iam.PolicyStatement({
      actions: ['sqs:sendmessage'],
      resources: [catalogItemsQueue.queueArn],
    });
    importFileParser.addToRolePolicy(sqsPolicy);
  }
}
