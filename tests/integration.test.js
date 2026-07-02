import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';

// Set environment variables before importing the app
process.env.PERSISTENCE = 'FS';
process.env.PORT = '0'; // listen on a dynamic random free port

// Dynamic imports to ensure env vars are applied
const { httpServer } = await import('../src/app.js');
const { productManager, cartManager } = await import('../src/dao/factory.js');

// FileSystem Mocking setup by redirecting paths to test-only JSON files
const testProductsPath = path.join(process.cwd(), 'tests/data/test-products.json');
const testCartsPath = path.join(process.cwd(), 'tests/data/test-carts.json');

productManager.path = testProductsPath;
cartManager.path = testCartsPath;
cartManager.productManagerPath = testProductsPath;

// Clean up files before and after
async function cleanTestData() {
    if (fs.existsSync(testProductsPath)) {
        await fs.promises.writeFile(testProductsPath, JSON.stringify([]));
    } else {
        await productManager.init();
    }
    if (fs.existsSync(testCartsPath)) {
        await fs.promises.writeFile(testCartsPath, JSON.stringify([]));
    } else {
        await cartManager.init();
    }
}

test.describe('Integration Tests (FS Persistence Mode)', () => {
    let baseUrl;

    test.before(async () => {
        const address = httpServer.address();
        baseUrl = `http://localhost:${address.port}`;
        await cleanTestData();
    });

    test.after(async () => {
        httpServer.close();
        // Clean up test files
        try {
            if (fs.existsSync(testProductsPath)) await fs.promises.unlink(testProductsPath);
            if (fs.existsSync(testCartsPath)) await fs.promises.unlink(testCartsPath);
            const dataDir = path.dirname(testProductsPath);
            if (fs.existsSync(dataDir)) {
                const files = await fs.promises.readdir(dataDir);
                if (files.length === 0) {
                    await fs.promises.rmdir(dataDir);
                }
            }
        } catch (e) {
            console.error('Error cleaning up test files:', e);
        }
    });

    test.beforeEach(async () => {
        await cleanTestData();
    });

    test.describe('Products API', () => {
        test('POST /api/products should create a new product', async () => {
            const productData = {
                title: 'Test Product',
                description: 'Description of test product',
                code: 'TEST001',
                price: 99.99,
                status: true,
                stock: 10,
                category: 'Test Category'
            };

            const response = await fetch(`${baseUrl}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            assert.strictEqual(response.status, 201);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.ok(data.payload.id);
            assert.strictEqual(data.payload.title, productData.title);
        });

        test('GET /api/products should return paginated products', async () => {
            await productManager.addProduct({
                title: 'Seed Product',
                description: 'Seed description',
                code: 'SEED001',
                price: 50.00,
                status: true,
                stock: 5,
                category: 'Seed Category'
            });

            const response = await fetch(`${baseUrl}/api/products`);
            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.ok(Array.isArray(data.payload));
            assert.strictEqual(data.payload.length, 1);
            assert.strictEqual(data.payload[0].title, 'Seed Product');
        });

        test('GET /api/products/:pid should return product by ID', async () => {
            const added = await productManager.addProduct({
                title: 'Find Me',
                description: 'Search target',
                code: 'FIND001',
                price: 15.00,
                status: true,
                stock: 100,
                category: 'Target'
            });

            const response = await fetch(`${baseUrl}/api/products/${added.id}`);
            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.strictEqual(data.payload.title, 'Find Me');
        });

        test('PUT /api/products/:pid should update the product details', async () => {
            const added = await productManager.addProduct({
                title: 'Old Title',
                description: 'Old desc',
                code: 'UPDATE001',
                price: 10.00,
                status: true,
                stock: 1,
                category: 'Old'
            });

            const updateData = { title: 'New Title', price: 20.00 };
            const response = await fetch(`${baseUrl}/api/products/${added.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.strictEqual(data.payload.title, 'New Title');
            assert.strictEqual(data.payload.price, 20.00);
        });

        test('DELETE /api/products/:pid should remove the product', async () => {
            const added = await productManager.addProduct({
                title: 'Delete Me',
                description: 'Target for deletion',
                code: 'DEL001',
                price: 5.00,
                status: true,
                stock: 1,
                category: 'Trash'
            });

            const response = await fetch(`${baseUrl}/api/products/${added.id}`, {
                method: 'DELETE'
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            await assert.rejects(
                async () => await productManager.getProductById(added.id),
                /Product not found/
            );
        });
    });

    test.describe('Carts API', () => {
        test('POST /api/carts should create an empty cart', async () => {
            const response = await fetch(`${baseUrl}/api/carts`, { method: 'POST' });
            assert.strictEqual(response.status, 201);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.ok(data.payload.id);
            assert.deepStrictEqual(data.payload.products, []);
        });

        test('POST /api/carts/:cid/products/:pid should add product to cart', async () => {
            const cart = await cartManager.createCart();
            const product = await productManager.addProduct({
                title: 'Cart Item',
                description: 'Product for cart',
                code: 'CARTITEM001',
                price: 12.50,
                status: true,
                stock: 10,
                category: 'Cart'
            });

            const response = await fetch(`${baseUrl}/api/carts/${cart.id}/products/${product.id}`, {
                method: 'POST'
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            const updatedCart = await cartManager.getCartById(cart.id);
            assert.strictEqual(updatedCart.products.length, 1);
            assert.strictEqual(updatedCart.products[0].product.id, product.id);
            assert.strictEqual(updatedCart.products[0].quantity, 1);
        });

        test('GET /api/carts/:cid should retrieve cart with populated products', async () => {
            const cart = await cartManager.createCart();
            const product = await productManager.addProduct({
                title: 'Populated Item',
                description: 'Detail verification',
                code: 'POP001',
                price: 1.00,
                status: true,
                stock: 10,
                category: 'Pop'
            });
            await cartManager.addProductToCart(cart.id, product.id);

            const response = await fetch(`${baseUrl}/api/carts/${cart.id}`);
            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            const responseCart = data.payload;
            assert.strictEqual(responseCart.products.length, 1);
            assert.strictEqual(responseCart.products[0].product.title, 'Populated Item');
            assert.strictEqual(responseCart.products[0].product.price, 1.00);
        });

        test('DELETE /api/carts/:cid/products/:pid should remove product from cart', async () => {
            const cart = await cartManager.createCart();
            const product = await productManager.addProduct({
                title: 'Removable',
                description: 'Description',
                code: 'REMOVE001',
                price: 2.00,
                status: true,
                stock: 10,
                category: 'Cat'
            });
            await cartManager.addProductToCart(cart.id, product.id);

            const response = await fetch(`${baseUrl}/api/carts/${cart.id}/products/${product.id}`, {
                method: 'DELETE'
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            const updatedCart = await cartManager.getCartById(cart.id);
            assert.strictEqual(updatedCart.products.length, 0);
        });

        test('PUT /api/carts/:cid should update all products in cart', async () => {
            const cart = await cartManager.createCart();
            const product1 = await productManager.addProduct({ title: 'P1', description: 'D1', code: 'C_P1', price: 10, stock: 10, category: 'C' });
            const product2 = await productManager.addProduct({ title: 'P2', description: 'D2', code: 'C_P2', price: 20, stock: 10, category: 'C' });

            const newProducts = [
                { product: product1.id, quantity: 3 },
                { product: product2.id, quantity: 5 }
            ];

            const response = await fetch(`${baseUrl}/api/carts/${cart.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: newProducts })
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            const updatedCart = await cartManager.getCartById(cart.id);
            assert.strictEqual(updatedCart.products.length, 2);
            assert.strictEqual(updatedCart.products[0].product.id, product1.id);
            assert.strictEqual(updatedCart.products[0].quantity, 3);
            assert.strictEqual(updatedCart.products[1].product.id, product2.id);
            assert.strictEqual(updatedCart.products[1].quantity, 5);
        });

        test('PUT /api/carts/:cid/products/:pid should update quantity', async () => {
            const cart = await cartManager.createCart();
            const product = await productManager.addProduct({ title: 'P', description: 'D', code: 'C_P', price: 10, stock: 10, category: 'C' });
            await cartManager.addProductToCart(cart.id, product.id);

            const response = await fetch(`${baseUrl}/api/carts/${cart.id}/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: 100 })
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            const updatedCart = await cartManager.getCartById(cart.id);
            assert.strictEqual(updatedCart.products[0].quantity, 100);
        });

        test('DELETE /api/carts/:cid should clear the cart products', async () => {
            const cart = await cartManager.createCart();
            const product = await productManager.addProduct({ title: 'P', description: 'D', code: 'C_P', price: 10, stock: 10, category: 'C' });
            await cartManager.addProductToCart(cart.id, product.id);

            const response = await fetch(`${baseUrl}/api/carts/${cart.id}`, {
                method: 'DELETE'
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            const updatedCart = await cartManager.getCartById(cart.id);
            assert.strictEqual(updatedCart.products.length, 0);
        });
    });
});
