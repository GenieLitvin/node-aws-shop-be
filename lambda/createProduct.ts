import { v4 as uuidv4 } from 'uuid';
import { ProductService, Product } from '../services/productService';


const productService = new ProductService();

export const handler = async (event:any) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { title, description, price, count } = body;

        if (!title || !description || !price) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid request, all fields are required' }),
            };
        }

        const product: Product = {
            id: uuidv4(),
            title,
            description,
            price: parseFloat(price),
            //count: parseInt(count, 10),
        };

        await productService.createProduct(product);

        return {
            statusCode: 201,
            body: JSON.stringify(product),
        };
    } catch (error) {
        console.error('Error creating product:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating product', error }),
        };
    }
};