import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class NodeAwsShopBeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    const getProductsListFunction = new lambda.Function(this, 'getProductsListFn', {
      runtime: lambda.Runtime.NODEJS_20_X, 
      code: lambda.Code.fromAsset('dist'), 
      handler: 'getProductsList.handler',
    });

    const getProductsByIdFunction = new lambda.Function(this, 'getProductsByIdFn', {
      runtime: lambda.Runtime.NODEJS_20_X, 
      code: lambda.Code.fromAsset('dist'), 
      handler: 'getProductsById.handler',
    });


    const api = new apigateway.LambdaRestApi(this, 'ProductsApi', {
      handler: getProductsListFunction,
      proxy: false
    });
        

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', undefined, {
      methodResponses: [{ statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        }, }],
    });

    const productsByIdResource = productsResource.addResource('{id}');
    productsByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFunction),{
      methodResponses: [{ statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        }, }],
    });;



 // Добавляем OPTIONS метод для поддержки CORS
    const corsOptions = {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
    };

    productsResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      }
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        },
      }],
    });

    productsByIdResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      }
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        },
      }],
    });
  }
}