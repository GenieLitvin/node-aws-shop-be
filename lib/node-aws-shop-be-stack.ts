import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class NodeAwsShopBeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    const getProductsListFunction = new lambda.Function(this, 'getProductsListFunction', {
      runtime: lambda.Runtime.NODEJS_20_X, 
      code: lambda.Code.fromAsset('dist/lambda'), 
      handler: 'getProductsList.handler',
    });

    const getProductsByIdFunction = new lambda.Function(this, 'getProductsByIdFunction', {
      runtime: lambda.Runtime.NODEJS_20_X, 
      code: lambda.Code.fromAsset('dist'), 
      handler: 'getProductsById.handler',
    });


    const api = new apigateway.LambdaRestApi(this, 'ProductdApi', {
      handler: getProductsListFunction,
      proxy: false,
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
