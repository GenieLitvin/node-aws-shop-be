import { Logger } from './logger';
import { StatusHandler } from './statusHandler';

export const reqHandler = (handler:Function) => async (event:any) => {    
    try {
      Logger.log(event);  
      return await handler(event);
    } catch (error) {
      return StatusHandler.ServerError(error);
    }
  };