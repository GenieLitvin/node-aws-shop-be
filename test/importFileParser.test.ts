import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Event } from 'aws-lambda';
import { createReadStream } from 'fs';
import { sdkStreamMixin } from '@smithy/util-stream';
import { handler } from '../import-service/lambda/importFileParser';
const s3Mock = mockClient(S3Client);

describe('importProductsFile', () => {
  it('should return uploadUrl', async () => {
    const stream = createReadStream('./test/data/upload.csv');
    const sdkStream = sdkStreamMixin(stream);

    s3Mock.on(GetObjectCommand).resolves({ Body: sdkStream });
    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({ DeleteMarker: true });

    const event = {
      Records: [
        {
          s3: {
            bucket: { name: 'node-aws-shop-be-upload' },
            object: { key: 'uploaded/testUpl.csv' },
          },
        },
      ],
    } as unknown as S3Event;

    const result = await handler(event);
    expect(result).toEqual(true);
  });
});
