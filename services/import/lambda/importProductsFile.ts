import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { reqHandler } from '../../../utils/reqHandler';
import { StatusHandler } from '../../../utils/statusHandler';
import { APIGatewayProxyEvent } from 'aws-lambda';

const s3 = new S3Client({ region: 'eu-west-1' });
const bucket = process.env.BUCKET_NAME;

export const handler = reqHandler(async (event: APIGatewayProxyEvent) => {
  const fileName = event.queryStringParameters?.name;
  const params = {
    Bucket: bucket,
    Key: `uploaded/${fileName}`,
  };
  const command = new PutObjectCommand(params);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return StatusHandler.Success({ uploadUrl: signedUrl });
});
