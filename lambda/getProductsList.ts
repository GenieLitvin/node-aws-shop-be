import { ProductService } from '../services/productService';

const productService = new ProductService();
import { basename, dirname } from "node:path";
exports.handler = async (event:any) => {

    const products = productService.getProductsList();
    const filename = basename(__filename);
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({f:filename, p:products}),
    };
};