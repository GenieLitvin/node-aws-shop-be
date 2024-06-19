import ProductsData from './products.json'

export interface Product{
    id: string,
    title: string,
    description: string,
    price: number,
} 


export class ProductService {

    private products: Product[];
    
    constructor(){
        this.products = ProductsData as Product[];
    }

    getProductsList():Product[]{
        return this.products;
    }
    getProductById(id:string): Product| undefined {
        return this.products.find((product)=>product.id == id);
    }
}