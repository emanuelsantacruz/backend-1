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
        const cart = carts.find(c => c.id === id || c.id.toString() === id.toString());
        if (!cart) throw new Error('Cart not found');

        const productsPath = this.productManagerPath || path.join(path.dirname(this.path), 'products.json');
        let products = [];
        if (fs.existsSync(productsPath)) {
            const productsData = await fs.promises.readFile(productsPath, 'utf-8');
            products = JSON.parse(productsData);
        }

        const populatedProducts = cart.products.map(p => {
            const foundProduct = products.find(prod => prod.id === p.product || prod.id.toString() === p.product.toString());
            return {
                product: foundProduct || { id: p.product, title: 'Unknown Product' },
                quantity: p.quantity
            };
        });

        return {
            id: cart.id,
            _id: cart.id,
            products: populatedProducts
        };
    }

    async createCart() {
        const carts = await this.getCarts();
        const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
        carts.push(newCart);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async addCart() {
        return this.createCart();
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId || c.id.toString() === cartId.toString());
        if (cartIndex === -1) throw new Error('Cart not found');

        const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId || p.product.toString() === productId.toString());
        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity += 1;
        } else {
            const idToStore = isNaN(productId) ? productId : parseInt(productId, 10);
            carts[cartIndex].products.push({ product: idToStore, quantity: 1 });
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }

    async removeProductFromCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId || c.id.toString() === cartId.toString());
        if (cartIndex === -1) throw new Error('Cart not found');

        carts[cartIndex].products = carts[cartIndex].products.filter(p => p.product !== productId && p.product.toString() !== productId.toString());
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }

    async updateCart(cartId, products) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId || c.id.toString() === cartId.toString());
        if (cartIndex === -1) throw new Error('Cart not found');

        carts[cartIndex].products = products.map(p => ({
            product: isNaN(p.product) ? p.product : parseInt(p.product, 10),
            quantity: p.quantity || 1
        }));
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }

    async updateProductQuantity(cartId, productId, quantity) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId || c.id.toString() === cartId.toString());
        if (cartIndex === -1) throw new Error('Cart not found');

        const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId || p.product.toString() === productId.toString());
        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity = quantity;
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return carts[cartIndex];
        } else {
            throw new Error('Product not found in cart');
        }
    }

    async clearCart(cartId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId || c.id.toString() === cartId.toString());
        if (cartIndex === -1) throw new Error('Cart not found');

        carts[cartIndex].products = [];
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }
}
