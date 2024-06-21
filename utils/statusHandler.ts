import { getCorsHeaders } from '../utils/corsHeaders';

export class StatusHandler {
  
  static ServerError(error: any) {
      console.error('Server Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error', error }),
      };
    }
  static Success(messsage: {}) {      
      return  {
        statusCode: 200,
        headers: {
           "Content-Type": "application/json" ,
            ...getCorsHeaders()
        },
        body: JSON.stringify(messsage)
    }
  }
  static Created(messsage: {}) {      
      return  {
        statusCode: 201,
        headers: {
           "Content-Type": "application/json" ,
            ...getCorsHeaders()
        },
        body: JSON.stringify(messsage)
    }
  }
  static NotFound(messsage: {}) {      
      return  {
        statusCode: 404,
        body: JSON.stringify(messsage),
      }
  }
  static BadRequest(messsage: {}) {      
    return  {
      statusCode: 400,
      body: JSON.stringify(messsage),
    }
}
}