#  CDK TypeScript project. API with API Gateway and AWS Lambda

This project is an AWS CDK-based application that deploys an API Gateway with Lambda functions for a product service. The service includes endpoints to retrieve a list of products and get product details by ID. It also includes Swagger documentation and unit tests using Jest.

## Task
1. Task: https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/04_integration_with_nosql_database/task.md

2. Screenshot:

3. Script to fill tables with test examples


4. Link to Product Service API https://9x60z5i1uc.execute-api.eu-west-1.amazonaws.com/prod/\

5. Link to FE PR
https://dknfbznwqkf8e.cloudfront.net/



6.  Score: 100 / 100
#### Task4:
- [x] Created two database tables in DynamoDB.
- [x] Writed a script to fill tables with test examples
```npm run db-fill```
- [x] AWS CDK Stack was updated with data database table and passed it to lambda’s environment variables section
- [x] Implemented a Product model on FE side as a joined model of product and stock by productId
- [x] Integrated the getProductsById lambda to return via ```GET /products/{productId}```
https://9x60z5i1uc.execute-api.eu-west-1.amazonaws.com/prod/products/9817a4f8-6f61-4544-b994-4482dbf6f170
- [x] Created a lambda function called ```createProduct```
#### Additional task:
- [x]+7.5 POST /products lambda functions returns error 400 status code if product data is invalid
- [x]+7.5 All lambdas return error 500 status code on any error (DB connection, any unhandled error in code)
```./utils/statusHandler.ts```
- [x]+7.5 All lambdas do console.log for each incoming requests and their arguments
```./utils/reqHandler.ts ```
```./utils/logger.ts ```
- [x] +7.5 Transaction based creation of product
```./services/productService.ts  createProduct ```
7. Swagger

https://app.swaggerhub.com/apis/EugeniaLitvin/Products/1.0.0