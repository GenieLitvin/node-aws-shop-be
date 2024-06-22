import { Logger } from './logger';
import { StatusHandler } from './statusHandler';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

type HandlerType = (
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;

export const reqHandler =
  (handler: HandlerType) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      Logger.log(event);
      return await handler(event);
    } catch (error) {
      return StatusHandler.ServerError(error);
    }
  };
