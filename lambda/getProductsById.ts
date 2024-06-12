//import {ProductService} from '../services/productService';
exports.handler = async (event:any) => {
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ message: event }),
    };
};