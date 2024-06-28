#  CDK TypeScript project. API with API Gateway and AWS Lambda

This project is an AWS CDK-based application that deploys an API Gateway with Lambda functions for a product service. The service includes endpoints to retrieve a list of products and get product details by ID. It also includes Swagger documentation and unit tests using Jest.

## Task 5 (Integration with S3)
1. https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/05_integration_with_s3/task.md

2. Screenshot:

3. Link to Import Product Service API https://tz7z29e0oc.execute-api.eu-west-1.amazonaws.com/prod/

4. Link to FE PR\
https://dknfbznwqkf8e.cloudfront.net/admin/products\
https://github.com/GenieLitvin/nodejs-aws-fe/pull/2


5.  Score: 100 / 100
#### Task5:
- [x] Created a new service ```import-service``` with its own AWS CDK Stack ```./import-service/node-aws-shop-be-import-stack.ts```.
- [x] In the AWS Console create and configure a new S3 bucket
- [x] Created a lambda function called  ```./import-service/lambda/importProductsFile.ts```
- [x] Create a lambda function called ```./import-service/lambda/importFileParser.ts```


#### Additional task:
- [x]+10 importProductsFile lambda is covered by unit tests
- [x]+10 importFileParser lambda is covered by unit tests.
- [x]+10 At the end of the stream the lambda function should move the file from the uploaded folder into the parsed folder
