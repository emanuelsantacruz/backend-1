import { Router } from 'express';
import * as viewsController from '../controllers/views.controller.js';

const router = Router();

router.get('/products', viewsController.renderProducts);
router.get('/products/:pid', viewsController.renderProductDetail);
router.get('/carts/:cid', viewsController.renderCart);
router.get('/realtimeproducts', viewsController.renderRealTimeProducts);

export default router;
