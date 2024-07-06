import { ProductRepository } from '../repository/product';
import { reqHandler } from '../utils/reqHandler';
import { StatusHandler } from '../utils/statusHandler';

const productService = new ProductRepository();

export const handler = reqHandler(async () => {
  const products = await productService.getProductsList();
  return StatusHandler.Success(products);
});
