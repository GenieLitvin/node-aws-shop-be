import { v4 as uuidv4 } from 'uuid';
import { ProductService, StockWithProduct } from '../productService';
import { reqHandler } from '../../../utils/reqHandler';
import { StatusHandler } from '../../../utils/statusHandler';
import { APIGatewayProxyEvent } from 'aws-lambda';

const productService = new ProductService();

const validator = (body: StockWithProduct) => {
  const { title, description, price, count } = body;

  if (
    !title ||
    !description ||
    !price ||
    Number(price) < 0 ||
    Number(count) < 0
  ) {
    return false;
  }
  return true;
};

export const handler = reqHandler(async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body || '{}');
  const { title, description, price, count = 0 } = body;

  if (!validator(body)) {
    return StatusHandler.BadRequest({
      message: 'Invalid request',
    });
  }

  const product: StockWithProduct = {
    id: uuidv4(),
    title,
    description,
    price: parseFloat(price),
    count: parseInt(count, 10),
  };

  await productService.createProduct(product);

  return StatusHandler.Created(product);
});
