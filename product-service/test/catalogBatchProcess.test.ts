import { handler } from '../lambda/catalogBatchProcess';
import { ProductRepository } from '../repository/product';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
jest.mock('../repository/product');

const snsMock = mockClient(SNSClient);

describe('catalogBatchProcess', () => {
  beforeEach(() => {
    snsMock.reset();
    jest.clearAllMocks();
  });
  it('should process records', async () => {
    (ProductRepository.prototype.createProduct as jest.Mock).mockResolvedValue(
      {},
    );
    snsMock.onAnyCommand().resolves({});

    const event = {
      Records: [
        {
          body: '{"title":"FR-Pandemic","description":"A cooperative board game where players work together to stop four diseases from spreading across the world.","price":"34.99","count":"8"}',
        },
      ],
    } as unknown as SQSEvent;
    await expect(handler(event)).resolves.toBeUndefined();
    expect(snsMock.commandCalls(PublishCommand).length).toBe(1);
  });

  it('should do not run createProduct on invalid records', async () => {
    (ProductRepository.prototype.createProduct as jest.Mock).mockResolvedValue(
      {},
    );
    snsMock.onAnyCommand().resolves({});

    const event = {
      Records: [
        {
          body: '{"description":"A cooperative board","price":"34.99","count":"8"}',
        },
        {
          body: '{"title":"FR-Pandemic","description":"A cooperative board","price":"34.99","count":"8"}',
        },
      ],
    } as unknown as SQSEvent;
    await expect(handler(event)).resolves.toBeUndefined();
    expect(ProductRepository.prototype.createProduct).toHaveBeenCalledTimes(1);
    expect(snsMock.commandCalls(PublishCommand).length).toBe(1);
  });
});
