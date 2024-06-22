import { ProductService } from '../services/productService';
import { reqHandler } from '../utils/reqHandler';
import { StatusHandler } from '../utils/statusHandler';
import { APIGatewayProxyEvent } from 'aws-lambda';
const productService = new ProductService();

export const handler = reqHandler(async (event: APIGatewayProxyEvent) => {
  const pathParameters = event.pathParameters;
  if (!pathParameters || !pathParameters.id) {
    return StatusHandler.BadRequest({ error: 'Product ID is required' });
  }

  const productId = pathParameters.id;
  const product = await productService.getProductById(productId);
  if (product) {
    return StatusHandler.Success(product);
  } else {
    return StatusHandler.NotFound({ error: 'Product not found' });
  }
});
