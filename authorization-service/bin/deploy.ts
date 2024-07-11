#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthorizationServiceStack } from '../lib/authorization-stack';
import * as dotenv from 'dotenv';

const app = new cdk.App();
dotenv.config();


new AuthorizationServiceStack(app, 'AuthorizationServiceStack',{
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    environmentVariables: {GenieLitvin: process.env.GenieLitvin},

}as any)