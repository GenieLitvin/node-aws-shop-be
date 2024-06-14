import {ProductService} from '../services/productService';

const productService = new ProductService();

export const handler = async (event:any) => {

    const { id } = event.pathParameters;

    const product = productService.getProductById(id);
    if (product){
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                'Access-Control-Allow-Headers': "'Content-Type",
                'Access-Control-Allow-Methods': "'OPTIONS,GET'",
                'Access-Control-Allow-Origin': "'*'",
            },
            body: JSON.stringify(product),
        };
    }else{
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Product not found' }),
        }
    }
};