import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import { Readable } from 'stream';

import csv from 'csv-parser';

const s3Client = new S3Client();

const parser = async (stream: Readable) => {
  return new Promise((resolve) => {
    stream
      .pipe(csv())
      .on('data', (data: string) => console.log(data))
      .on('end', () => {
        console.log('end!');
        resolve(true);
      });
  });
};

export const handler = async (event: S3Event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;

  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };
  try {
    const command = new GetObjectCommand(params);
    const data = await s3Client.send(command);

    const stream = data.Body as Readable;
    await parser(stream);

    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      Key: `parsed/${objectKey.split('/').pop()}`,
      CopySource: `${bucketName}/${objectKey}`,
    });
    await s3Client.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand(params);
    const { DeleteMarker } = await s3Client.send(deleteCommand);

    return DeleteMarker;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
