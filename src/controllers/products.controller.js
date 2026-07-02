import { productManager } from '../dao/factory.js';

export const getProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const result = await productManager.getProducts(limit, page, sort, query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.json({ status: 'success', payload: product });
    } catch (error) {
        res.status(404).json({ status: 'error', error: error.message });
    }
};

export const addProduct = async (req, res) => {
    try {
        const productData = req.body;
        
        const newProduct = await productManager.addProduct(productData);

        req.app.get('socketio').emit('productsUpdate', await productManager.getProducts(100, 1));
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        console.log("error en el post de producto", error);
        res.status(400).json({ status: 'error', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        req.app.get('socketio').emit('productsUpdate', await productManager.getProducts(100, 1));
        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await productManager.deleteProduct(req.params.pid);
        req.app.get('socketio').emit('productsUpdate', await productManager.getProducts(100, 1));
        res.json({ status: 'success', payload: deletedProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
};
