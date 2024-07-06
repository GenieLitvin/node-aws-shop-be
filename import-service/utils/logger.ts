import { APIGatewayProxyEvent, S3Event } from 'aws-lambda';

export class Logger {
  static log(event: APIGatewayProxyEvent | S3Event): void {
    if (this.isApiGatewayEvent(event)) {
      console.log('API Gateway Event:', JSON.stringify(event, null, 2));
    } else if (this.isS3Event(event)) {
      console.log('MY S3 Event:', JSON.stringify(event, null, 2));
    } else {
      console.log('Unknown Event:', JSON.stringify(event, null, 2));
    }
  }

  static error(error: string): void {
    console.error('Error:', error);
  }

  private static isApiGatewayEvent(
    event: unknown,
  ): event is APIGatewayProxyEvent {
    return (event as APIGatewayProxyEvent).httpMethod !== undefined;
  }

  private static isS3Event(event: unknown): event is S3Event {
    return (
      (event as S3Event).Records !== undefined &&
      (event as S3Event).Records[0].eventSource === 'aws:s3'
    );
  }
}
