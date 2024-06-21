import {ProductService} from '../services/productService';
import {reqHandler} from '../utils/reqHandler';
import { StatusHandler } from '../utils/statusHandler';

const productService = new ProductService();

export const handler = reqHandler(async (event:any) => {
        const { id } = event.pathParameters;
        const product = await productService.getProductById(id);
        if (product){
            return StatusHandler.Success(product)
        }else{
            return StatusHandler.NotFound({ error: 'Product not found' })
        }
});