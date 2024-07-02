import { v4 as uuidv4 } from 'uuid';
import { ProductRepository } from '../repository/product';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { ProductSchema } from '../utils/validator';
import { StockWithProduct } from '../types/product';

const productRepository = new ProductRepository();

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
  } catch (error) {
    console.error('Invalid product data:', error);
  }
};

export const handler = async (event: SQSEvent) => {
  const records = event.Records;
  try {
    await Promise.all(records.map((record) => processRecord(record)));
  } catch (error) {
    console.error('Error processing records:', error);
    throw error;
  }
};