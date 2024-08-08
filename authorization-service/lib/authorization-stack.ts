import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface AuthorizationServiceStackProps extends cdk.StackProps {
  environmentVariables: { [key: string]: string };
}
export class AuthorizationServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: AuthorizationServiceStackProps,
  ) {
    super(scope, id, props);

    if (!props) {
      throw new Error('Props must be defined');
    }

    new lambda.Function(this, 'authorizationFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'basicAuthorizer.handler',
      environment: props.environmentVariables,
    });
  }
}
