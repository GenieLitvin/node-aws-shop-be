import { handler } from '../lambda/getProductsList';
import { ProductService } from '../services/productService';

jest.mock('../services/productService');

describe('getProductsList', () => {
  it('should return a list of products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', description: 'Description 1', price: 100 },
      { id: 2, name: 'Product 2', description: 'Description 2', price: 200 },
    ];

    (ProductService.prototype.getProductsList as jest.Mock).mockReturnValue(mockProducts);

    const event = {};
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.body).toBe(JSON.stringify(mockProducts));
  });
});