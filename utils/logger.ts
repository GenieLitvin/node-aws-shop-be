import { APIGatewayProxyEvent } from 'aws-lambda';
export class Logger {
  static log(event: APIGatewayProxyEvent) {
    console.log({
      path: event.path,
      method: event.httpMethod,
      header: event.headers,
      body: event.body,
    });
  }
}
