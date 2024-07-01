import { getCorsHeaders } from '../utils/corsHeaders';

export class StatusHandler {
  static ServerError(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Server Error:', errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', errorMessage }),
    };
  }
  static Success(messsage: object) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(),
      },
      body: JSON.stringify(messsage),
    };
  }
  static Created(messsage: object) {
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(),
      },
      body: JSON.stringify(messsage),
    };
  }
  static NotFound(messsage: object) {
    return {
      statusCode: 404,
      body: JSON.stringify(messsage),
    };
  }
  static BadRequest(messsage: object) {
    return {
      statusCode: 400,
      body: JSON.stringify(messsage),
    };
  }
}
