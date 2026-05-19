import { cartModel } from '../../models/cart.model.js';

export default class CartManagerMongo {
    async createCart() {
        try {
            const newCart = await cartModel.create({ products: [] });
            return newCart;
        } catch (error) {
            console.error('Error in createCart:', error);
            throw new Error('Could not create cart');
        }
    }

    async getCartById(id) {
        try {
            const cart = await cartModel.findById(id).lean();
            if (!cart) throw new Error('Cart not found');
            return cart;
        } catch (error) {
            console.error('Error in getCartById:', error);
            throw new Error('Could not fetch cart');
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Cart not found');

            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error in addProductToCart:', error);
            throw new Error('Could not add product to cart');
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Cart not found');

            cart.products = cart.products.filter(p => p.product._id.toString() !== productId);
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error in removeProductFromCart:', error);
            throw new Error('Could not remove product from cart');
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Cart not found');

            cart.products = products;
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error in updateCart:', error);
            throw new Error('Could not update cart');
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Cart not found');

            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                await cart.save();
                return cart;
            } else {
                throw new Error('Product not found in cart');
            }
        } catch (error) {
            console.error('Error in updateProductQuantity:', error);
            throw new Error('Could not update product quantity');
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Cart not found');

            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error in clearCart:', error);
            throw new Error('Could not clear cart');
        }
    }
}
