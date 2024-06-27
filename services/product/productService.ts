//import ProductsData from './products.json'
import {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface Stock {
  product_id: string;
  count: number;
}

export type StockWithProduct = Product & Omit<Stock, 'product_id'>;

export class ProductService {
  private products: Product[];
  private stockWithProduct: StockWithProduct[];

  private docClient: DynamoDBClient;
  private productTableName: string;
  private stockTableName: string;

  constructor() {
    this.productTableName = process.env.PRODUCT_TABLE_NAME!;
    this.stockTableName = process.env.STOCK_TABLE_NAME!;
    this.docClient = new DynamoDBClient({});
  }

  async getProductsList(): Promise<StockWithProduct[]> {
    const productCommand = new ScanCommand({
      TableName: this.productTableName,
    });
    const stockCommand = new ScanCommand({
      TableName: this.stockTableName,
    });

    const [productData, stockData] = await Promise.all([
      this.docClient.send(productCommand),
      this.docClient.send(stockCommand),
    ]);

    const unmarshall_products = productData.Items?.map((item) =>
      unmarshall(item),
    ) as StockWithProduct[];
    const unmarshall_stock = stockData.Items?.map((item) =>
      unmarshall(item),
    ) as Stock[];

    const stockMap = new Map<string, number>();
    for (const stock of unmarshall_stock) {
      stockMap.set(stock.product_id, stock.count);
    }

    const result = unmarshall_products.map((product) => ({
      ...product,
      count: stockMap.get(product.id) || 0,
    }));

    return result;
  }
  async getProductById(
    productId: string,
  ): Promise<StockWithProduct | undefined> {
    const productCommand = new GetItemCommand({
      TableName: this.productTableName,
      Key: { id: { S: productId } },
    });
    const stockCommand = new GetItemCommand({
      TableName: this.stockTableName,
      Key: { product_id: { S: productId } },
    });
    const [productData, stockData] = await Promise.all([
      this.docClient.send(productCommand),
      this.docClient.send(stockCommand),
    ]);

    const unmarshall_product = productData.Item
      ? (unmarshall(productData.Item) as Product)
      : undefined;
    const unmarshall_stock = stockData.Item
      ? (unmarshall(stockData.Item) as Stock)
      : undefined;
    return unmarshall_product
      ? { ...unmarshall_product, count: unmarshall_stock?.count || 0 }
      : undefined;
  }

  async createProduct(stockWithProduct: StockWithProduct): Promise<void> {
    const { id, title, description, price, count } = stockWithProduct;

    const productItem = {
      id,
      title,
      description,
      price,
    };
    const stockItem = {
      product_id: id,
      count,
    };
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: this.productTableName,
            Item: marshall(productItem),
          },
        },
        {
          Put: {
            TableName: this.stockTableName,
            Item: marshall(stockItem),
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(params);
    await this.docClient.send(command);
  }
}
