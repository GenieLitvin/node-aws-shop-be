#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductServiseStack } from '../lib/product-service-stack';

const app = new cdk.App();
new ProductServiseStack(app, 'ProductServiseStack', {
});
