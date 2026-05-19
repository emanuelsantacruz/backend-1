import fs from 'fs';
import path from 'path';

export default class CartManager {
    constructor(filePath) {
        this.path = filePath || path.join(process.cwd(), 'src/dao/fs/data/carts.json');
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

    async getCarts() {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        return carts.find(c => c.id === id);
    }

    async addCart() {
        const carts = await this.getCarts();
        const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
        carts.push(newCart);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) throw new Error('Cart not found');

        const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId);
        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity += 1;
        } else {
            carts[cartIndex].products.push({ product: productId, quantity: 1 });
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }
}
