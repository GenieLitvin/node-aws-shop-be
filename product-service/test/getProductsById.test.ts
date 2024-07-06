import { handler } from '../lambda/getProductsById';
import { ProductRepository } from '../repository/product';
import { APIGatewayProxyEvent } from 'aws-lambda';
jest.mock('../repository/product');
type PartialAPIGatewayProxyEvent = Partial<APIGatewayProxyEvent>;

describe('getProductsById', () => {
  it('should return a product by id', async () => {
    const mockProduct = {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
    };

    (ProductRepository.prototype.getProductById as jest.Mock).mockReturnValue(
      mockProduct,
    );

    const event: PartialAPIGatewayProxyEvent = {
      pathParameters: { id: '1' },
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    // expect(result.headers?['Content-Type']).toBe('application/json');
    expect(result.body).toBe(JSON.stringify(mockProduct));
  });

  it('should return 404 if product not found', async () => {
    (ProductRepository.prototype.getProductById as jest.Mock).mockReturnValue(
      undefined,
    );

    const event: PartialAPIGatewayProxyEvent = {
      pathParameters: { id: '999' },
    };
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);
    // expect(result.headers?['Content-Type']).toBe('application/json');
    expect(result.body).toBe(JSON.stringify({ error: 'Product not found' }));
  });
});
