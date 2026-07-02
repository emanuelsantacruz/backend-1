import { cartManager } from '../dao/factory.js';

export const createCart = async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
};

export const getCartById = async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(404).json({ status: 'error', error: error.message });
    }
};

export const addProductToCart = async (req, res) => {
    try {
        const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
};

export const removeProductFromCart = async (req, res) => {
    try {
        const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
};

export const updateCart = async (req, res) => {
    try {
        const products = req.body.products || [];
        const cart = await cartManager.updateCart(req.params.cid, products);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
};

export const updateProductQuantity = async (req, res) => {
    try {
        const quantity = req.body.quantity;
        const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await cartManager.clearCart(req.params.cid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
};
