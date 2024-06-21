import { v4 as uuidv4 } from 'uuid';
import { ProductService, StockWithProduct } from '../services/productService';
import {reqHandler} from '../utils/reqHandler';
import { StatusHandler} from '../utils/statusHandler';

const productService = new ProductService();


export const handler = reqHandler(async (event:any) => {
        const body = JSON.parse(event.body || '{}');
        const { title, description, price, count=0 } = body;

        if (!title || !description || !price) {
            return StatusHandler.BadRequest({ message: 'Invalid request, all fields are required' })
        }

        const product: StockWithProduct = {
            id: uuidv4(),
            title,
            description,
            price: parseFloat(price),
            count: parseInt(count, 10),
        };

        await productService.createProduct(product);

        return StatusHandler.Created(product)
});