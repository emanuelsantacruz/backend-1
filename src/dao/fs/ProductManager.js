import fs from 'fs';
import path from 'path';

export default class ProductManager {
    constructor(filePath) {
        this.path = filePath || path.join(process.cwd(), 'src/dao/fs/data/products.json');
        this.init();
    }

    async init() {
        if (!fs.existsSync(path.dirname(this.path))) {
            fs.mkdirSync(path.dirname(this.path), { recursive: true });
        }
        if (!fs.existsSync(this.path)) {
            await fs.promises.writeFile(this.path, JSON.stringify([]));
        }
    }

    async getProducts() {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === id);
    }

    async addProduct(product) {
        const products = await this.getProducts();
        product.id = products.length ? products[products.length - 1].id + 1 : 1;
        products.push(product);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return product;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');
        products[index] = { ...products[index], ...updatedFields, id };
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        if (products.length === filtered.length) throw new Error('Product not found');
        await fs.promises.writeFile(this.path, JSON.stringify(filtered, null, 2));
    }
}
