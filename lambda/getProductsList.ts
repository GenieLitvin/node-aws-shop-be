import { ProductService } from '../services/productService';
import { Logger  } from './logger';
import { ErrorHandler } from './errorHandler';

const productService = new ProductService();
export const handler = async (event:any) => {
    try {
        Logger.log(event);
    
        const products = await productService.getProductsList();
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" ,
                'Access-Control-Allow-Headers': "Content-Type",
                'Access-Control-Allow-Methods': "OPTIONS,GET",
                'Access-Control-Allow-Origin': "*",
            },
            body: JSON.stringify(products)
        };

    } catch (error) {
        return ErrorHandler.handleError(error);
    }
};