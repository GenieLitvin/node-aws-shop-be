import { ProductService } from '../productService';
import { reqHandler } from '../../utils/reqHandler';
import { StatusHandler } from '../../utils/statusHandler';

const productService = new ProductService();

export const handler = reqHandler(async () => {
  const products = await productService.getProductsList();
  return StatusHandler.Success(products);
});
