import { handler } from '../lambda/getProductsById';
import { ProductService } from '../services/productService';

jest.mock('../services/productService');

describe('getProductsById', () => {
    it('should return a product by id', async () => {
        const mockProduct = { id: 1, name: 'Product 1', description: 'Description 1', price: 100 };

        (ProductService.prototype.getProductById as jest.Mock).mockReturnValue(mockProduct);

        const event = { pathParameters: { id: '1' } };
        const result = await handler(event);

        expect(result.statusCode).toBe(200);
       // expect(result.headers?['Content-Type']).toBe('application/json');
        expect(result.body).toBe(JSON.stringify(mockProduct));
    });

    it('should return 404 if product not found', async () => {
        (ProductService.prototype.getProductById as jest.Mock).mockReturnValue(undefined);

        const event = { pathParameters: { id: '999' } };
        const result = await handler(event);

        expect(result.statusCode).toBe(404);
       // expect(result.headers?['Content-Type']).toBe('application/json');
        expect(result.body).toBe(JSON.stringify({ error: 'Product not found' }));
    });
});