import { ProductService } from '../services/productService';

const productService = new ProductService();

export const handler = async (event:any) => {

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
};