import { v4 as uuidv4 } from 'uuid';
import { ProductService, Product, StockWithProduct } from '../services/productService';
import { Logger } from './logger';
import { ErrorHandler } from './errorHandler';

const productService = new ProductService();


export const handler = async (event:any) => {
    try {
        Logger.log(event);
        const body = JSON.parse(event.body || '{}');
        const { title, description, price, count=0 } = body;

        if (!title || !description || !price) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid request, all fields are required' }),
            };
        }

        const product: StockWithProduct = {
            id: uuidv4(),
            title,
            description,
            price: parseFloat(price),
            count: parseInt(count, 10),
        };

        await productService.createProduct(product);

        return {
            statusCode: 201,
            body: JSON.stringify(product),
        };
    } catch (error) {
        return ErrorHandler.handleError(error);
    }
};