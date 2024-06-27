import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import { Readable } from 'stream';
import { reqHandler } from '../utils/reqHandler';
import { StatusHandler } from '../utils/statusHandler';
import csv from 'csv-parser';

const s3Client = new S3Client();

const streamToString = (stream: Readable): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });

export const handler = reqHandler(async (event: S3Event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;

  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  const command = new GetObjectCommand(params);
  const data = await s3Client.send(command);
  const stream = data.Body as Readable;

  stream
    .pipe(csv())
    .on('data', (data) => console.log(data))
    .on('end', () => {
      console.log('end');
    });

  const fileContent = await streamToString(data.Body as Readable);

  console.log('File Content:', fileContent);

  return StatusHandler.Success({
    message: 'File processed successfully',
  });
});
