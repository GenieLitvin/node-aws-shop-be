export class ErrorHandler {
    static handleError(error: any) {
      console.error('Server Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error', error }),
      };
    }
  }