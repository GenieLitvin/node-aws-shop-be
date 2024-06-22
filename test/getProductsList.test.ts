import { handler } from '../lambda/getProductsList';
import { ProductService } from '../services/productService';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('../services/productService');

describe('getProductsList', () => {
  it('should return a list of products', async () => {
    const mockProducts = [
      {
        id: '7420c847-076d-4c21-8e7f-9d2b3b9a03c3',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        count: 1,
      },
      {
        id: '8c8d8ee8-289d-4312-bc50-173a1c6beee6',
        name: 'Product 2',
        description: 'Description 2',
        price: 200,
      },
    ];

    (ProductService.prototype.getProductsList as jest.Mock).mockReturnValue(
      mockProducts,
    );

    const event = {};
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers ? result.headers['Content-Type'] : '').toBe(
      'application/json',
    );
    expect(result.body).toBe(JSON.stringify(mockProducts));
  });
});
