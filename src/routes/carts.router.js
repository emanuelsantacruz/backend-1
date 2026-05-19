import { Router } from 'express';
import * as cartsController from '../controllers/carts.controller.js';

const router = Router();

router.post('/', cartsController.createCart);
router.get('/:cid', cartsController.getCartById);
router.post('/:cid/products/:pid', cartsController.addProductToCart);
router.delete('/:cid/products/:pid', cartsController.removeProductFromCart);
router.put('/:cid', cartsController.updateCart);
router.put('/:cid/products/:pid', cartsController.updateProductQuantity);
router.delete('/:cid', cartsController.clearCart);

export default router;
