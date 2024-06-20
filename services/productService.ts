//import ProductsData from './products.json'
import { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";

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


        const unmarshall_products = productData.Items?.map(item => unmarshall(item)) as Product[];
        const unmarshall_stock = stockData.Items?.map(item => unmarshall(item)) as Stock[];

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
    async getProductById(productId:string): Promise<Product| undefined> {
        
        const productCommand = new GetItemCommand({
            TableName: this.productTableName,
            Key: { "id": { S: productId }},
        });

        
        const productData = await  this.docClient.send(productCommand)
        //console.log(productData)
        const unmarshall_product = productData.Item?unmarshall(productData.Item) as Product:undefined;
        return unmarshall_product;
    }
    async createProduct(product: Product): Promise<void> {
        const { id, title, description, price } = product;

        const productCommand = new PutItemCommand({
            TableName: this.productTableName,
            Item: marshall({
                id,
                title,
                description,
                price
            }),
        });
        
        await this.docClient.send(productCommand)
    }

}
