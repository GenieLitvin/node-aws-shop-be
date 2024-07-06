import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';

export class ProductServiseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //dynamodb
    const productTable = dynamodb.TableV2.fromTableName(
      this,
      'ProductTable',
      'Product',
    );
    const stockTable = dynamodb.Table.fromTableName(
      this,
      'StockTable',
      'Stock',
    );

    const dynamoPolicy = new iam.PolicyStatement({
      actions: ['dynamodb:*'],
      resources: [productTable.tableArn, stockTable.tableArn],
    });
    //sns
    const createProductTopic = new sns.Topic(this, 'createProductTopic', {
      signatureVersion: '2',
    });
    const catalogSqs = new sqs.Queue(this, 'catalogItemsQueue');

    const environment = {
      PRODUCT_TABLE_NAME: productTable.tableName,
      STOCK_TABLE_NAME: stockTable.tableName,
      SQS_NAME: catalogSqs.queueName,
      SNS_TOPIC_ARN: createProductTopic.topicArn,
    };

    const getProductsListFunction = new lambda.Function(
      this,
      'getProductsListFn',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('dist'),
        handler: 'getProductsList.handler',
        environment,
      },
    );
    getProductsListFunction.addToRolePolicy(dynamoPolicy);

    const getProductsByIdFunction = new lambda.Function(
      this,
      'getProductsByIdFn',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('dist'),
        handler: 'getProductsById.handler',
        environment,
      },
    );
    getProductsByIdFunction.addToRolePolicy(dynamoPolicy);

    const createProductFunction = new lambda.Function(this, 'createProductFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'createProduct.handler',
      environment,
    });

    createProductFunction.addToRolePolicy(dynamoPolicy);

    //RestAPI
    const api = new apigateway.LambdaRestApi(this, 'ProductsApi', {
      handler: getProductsListFunction,
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

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', undefined, {
      methodResponses: [{ statusCode: '200' }],
    });

    productsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createProductFunction),
      {
        methodResponses: [{ statusCode: '400' }],
      },
    );

    const productsByIdResource = productsResource.addResource('{id}');
    productsByIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsByIdFunction),
      {
        methodResponses: [{ statusCode: '200' }],
      },
    );

    const catalogBatchProcessFunction = new lambda.Function(
      this,
      'catalogBatchProcessFn',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('dist'),
        handler: 'catalogBatchProcess.handler',
        environment,
      },
    );
    catalogBatchProcessFunction.addEventSource(
      new eventsources.SqsEventSource(catalogSqs, {
        batchSize: 5,
      }),
    );
    catalogBatchProcessFunction.addToRolePolicy(dynamoPolicy);

    // SNS Subscription
    new sns.Subscription(this, 'Subscription1', {
      endpoint: 'genie.litvin@gmail.com',
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
      filterPolicy: {
        price: sns.SubscriptionFilter.numericFilter({
          greaterThan: 40,
        }),
      },
    });
    new sns.Subscription(this, 'Subscription2', {
      endpoint: 'yauheniya8@gmail.com',
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
      filterPolicy: {
        price: sns.SubscriptionFilter.numericFilter({
          lessThan: 40,
        }),
      },
    });

    const snsPolicy = new iam.PolicyStatement({
      actions: ['sns:Publish'],
      resources: [createProductTopic.topicArn],
    });
    catalogBatchProcessFunction.addToRolePolicy(snsPolicy);
  }
}
