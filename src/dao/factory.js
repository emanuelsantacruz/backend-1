import 'dotenv/config';

let productManager;
let cartManager;

const PERSISTENCE = process.env.PERSISTENCE || 'MONGO';

switch (PERSISTENCE.toUpperCase()) {
    case 'FS':
        const { default: ProductManagerFS } = await import('./fs/ProductManager.js');
        const { default: CartManagerFS } = await import('./fs/CartManager.js');
        productManager = new ProductManagerFS();
        cartManager = new CartManagerFS();
        console.log('Persistence mode: File System (FS)');
        break;
    case 'MONGO':
    default:
        const { default: ProductManagerMongo } = await import('./mongo/ProductManagerMongo.js');
        const { default: CartManagerMongo } = await import('./mongo/CartManagerMongo.js');
        productManager = new ProductManagerMongo();
        cartManager = new CartManagerMongo();
        console.log('Persistence mode: MongoDB (MONGO)');
        break;
}

export { productManager, cartManager };
