import { v4 as uuidv4 } from 'uuid';
import { ProductRepository } from '../repository/product';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { ProductSchema } from '../utils/validator';
import { StockWithProduct } from '../types/product';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const productRepository = new ProductRepository();
export const snsClient = new SNSClient({});

const processRecord = async (record: SQSRecord) => {
  const { title, description, price, count = 0 } = JSON.parse(record.body);
  const product: StockWithProduct = {
    id: uuidv4(),
    title,
    description,
    price: parseFloat(price),
    count: parseInt(count, 10),
  };
  try {
    ProductSchema.parse(product);
    await productRepository.createProduct(product);
    await notificate(product);
  } catch (error) {
    console.log('Invalid product data:', error);
  }
};

const notificate = async (product: StockWithProduct) => {
  try{
    await snsClient.send(
      new PublishCommand({
        Message: `New products in shop: ${product.title}, price : ${product.price}`,
        MessageAttributes: {
          price: {
            DataType: 'Number',
            StringValue: product.price.toString(),
          },
        },
        TopicArn: process.env.SNS_TOPIC_ARN,
      }),
    );
    //console.log('notification', product);
  }catch (error) {
    console.log('notification error:', error);
  }
  
};

export const handler = async (event: SQSEvent) => {
  const records = event.Records;
  //console.log('new RECORDS', records);
  try {
    await Promise.all(records.map((record) => processRecord(record)));
  } catch (error) {
    console.error('Error processing records:', error);
    throw error;
  }
};
