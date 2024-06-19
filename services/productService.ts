//import ProductsData from './products.json'
import { DynamoDBClient, ScanCommand  } from '@aws-sdk/client-dynamodb';
import { unmarshall } from "@aws-sdk/util-dynamodb";

export interface Product{
    id: string,
    title: string,
    description: string,
    price: number,
} 

export interface Stock{
    product_id:string,
    count:number
}

type StockWithProduct =  Product|Stock;




export class ProductService {

    private products: Product[];
    private stockWithProduct: StockWithProduct[];

    private docClient:DynamoDBClient;
    private productTableName :string;
    private stockTableName :string;

    constructor(){
        this.productTableName  = process.env.PRODUCT_TABLE_NAME!;
        this.stockTableName = process.env.STOCK_TABLE_NAME!;
        this.docClient = new DynamoDBClient ({});
    }

    async getProductsList():Promise<StockWithProduct[]>{

        const command = new ScanCommand({
            TableName: this.productTableName,
          });
        const products = await this.docClient.send(new ScanCommand({
            TableName: this.productTableName,
        }));
        const stock =  await this.docClient.send(new ScanCommand({
            TableName: this.stockTableName,
        }));

        const unmarshall_products = products.Items?.map(item => unmarshall(item)) as Product[];
        const unmarshall_stock = stock.Items?.map(item => unmarshall(item)) as Stock[];

        const stockMap = new Map<string, number>();
        for (const stock of unmarshall_stock) {
            stockMap.set(stock.product_id, stock.count);
        }

        const result = unmarshall_products.map(product => ({
            ...product,
            count: stockMap.get(product.id) || 0,
          }))
        
        return result

    }
    getProductById(id:string): Product| undefined {
        return this.products.find((product)=>product.id == id);
    }


}