import { productManager, cartManager } from '../dao/factory.js';

export const renderProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const result = await productManager.getProducts(limit, page, sort, query);
        res.render('products', {
            title: 'Products List',
            products: result.payload,
            page: result.page,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            prevLink: result.prevLink,
            nextLink: result.nextLink
        });
    } catch (error) {
        res.status(500).send('Error loading products');
    }
};

export const renderProductDetail = async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.render('product', {
            title: product.title,
            product
        });
    } catch (error) {
        res.status(404).send('Product not found');
    }
};

export const renderCart = async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        res.render('cart', {
            title: 'Cart Details',
            cart
        });
    } catch (error) {
        res.status(404).send('Cart not found');
    }
};

export const renderRealTimeProducts = async (req, res) => {
    try {
        res.render('realTimeProducts', {
            title: 'Real-Time Products'
        });
    } catch (error) {
        res.status(500).send('Error loading view');
    }
};
