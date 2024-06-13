import { ProductService } from '../services/productService';

const productService = new ProductService();

exports.handler = async (event:any) => {

    const products = productService.getProductsList();
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