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
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS, // ALLOW GET, POST, PUT, DELETE, etc.
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      }
    });
        

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', undefined, {
      methodResponses: [{ statusCode: '200', }],
    });

    const productsByIdResource = productsResource.addResource('{id}');
    productsByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFunction),{
      methodResponses: [{ statusCode: '200', }],
    });;

  }
}
