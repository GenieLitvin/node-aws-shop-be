import { handler } from '../services/import/lambda/importProductsFile';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { StatusHandler } from '../utils/statusHandler';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Mock = mockClient(S3Client);

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('importProductsFile', () => {
  beforeEach(() => {
    s3Mock.reset();
  });
  it('should return uploadUrl', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: { name: 'file.csv' },
    };
    const signedUrl = 'https://signed-url.com';
    (getSignedUrl as jest.Mock).mockResolvedValue(signedUrl);

    const result = await handler(event as APIGatewayProxyEvent);

    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.any(S3Client),
      expect.any(PutObjectCommand),
      { expiresIn: 300 },
    );

    expect(result).toEqual(StatusHandler.Success({ uploadUrl: signedUrl }));
  });
});
