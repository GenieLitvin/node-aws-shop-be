import { ProductService } from '../services/productService';
import { reqHandler } from '../utils/reqHandler';
import { StatusHandler } from '../utils/statusHandler';

const productService = new ProductService();

export const handler = reqHandler(async (event:any) => {

    const products = await productService.getProductsList();
    return StatusHandler.Success(products)

});