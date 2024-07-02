import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { S3Event, S3EventRecord } from 'aws-lambda';
import { Readable } from 'stream';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import csv from 'csv-parser';

const s3Client = new S3Client();
const sqsClient = new SQSClient();
type product = {
  ID: string;
  TITLE: string;
  DESCRIPTION: string;
  PRICE: string;
  COUNT: string;
};

const send = async (data: product) => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(data),
    });
    await sqsClient.send(command);
  } catch (error) {
    console.log(`sqsClient error ${error}`);
    throw error;
  }
};

const parser = async (stream: Readable): Promise<product[]> => {
  const result: product[] = [];
  return new Promise((resolve) => {
    stream
      .pipe(csv())
      .on('data', async (data: product) => result.push(data))
      .on('end', () => {
        resolve(result);
      });
  });
};

const processRecord = async (record: S3EventRecord) => {
  const bucketName = record.s3.bucket.name;
  const objectKey = record.s3.object.key;

  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const command = new GetObjectCommand(params);
    const data = await s3Client.send(command);

    const stream = data.Body as Readable;
    const result: product[] = await parser(stream);

    await Promise.all(result.map((record: product) => send(record)));

    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      Key: `parsed/${objectKey.split('/').pop()}`,
      CopySource: `${bucketName}/${objectKey}`,
    });
    await s3Client.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand(params);
    const { DeleteMarker } = await s3Client.send(deleteCommand);

    console.log(`Processed and deleted ${objectKey}`);
    return DeleteMarker;
  } catch (error) {
    console.log(`Error processing ${objectKey}:`, error);
    throw error;
  }
};

export const handler = async (event: S3Event) => {
  try {
    await Promise.all(event.Records.map((record) => processRecord(record)));
  } catch (error) {
    console.error('Error processing records:', error);
    throw error;
  }
};
