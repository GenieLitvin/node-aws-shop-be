import { Logger } from './logger';
import { StatusHandler } from './statusHandler';
import {
  APIGatewayProxyEvent,
  S3Event,
  APIGatewayProxyResult,
} from 'aws-lambda';
type EventTypes = APIGatewayProxyEvent | S3Event;
type ResultType = APIGatewayProxyResult;

type HandlerType<E extends EventTypes> = (event: E) => Promise<ResultType>;

export const reqHandler =
  <E extends EventTypes>(fnhandler: HandlerType<E>) =>
  async (event: E): Promise<ResultType> => {
    try {
      Logger.log(event);
      return await fnhandler(event);
    } catch (error) {
      return StatusHandler.ServerError(error);
    }
  };
