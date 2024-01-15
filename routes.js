import express from 'express';
import authenticationRouter from './src/api/authentication/auth.routes.js';
import productRouter from './src/api/product/product.routes.js';
import discountRouter from './src/api/discount/discount.routes.js';
import userRouter from './src/api/user/user.routes.js';
import cartRouter from './src/api/cart/cart.routes.js';
import orderRouter from './src/api/order/order.routes.js';
import commentRouter from './src/api/comment/comment.routes.js';

const router = express.Router();

router.use('/auth', authenticationRouter);
router.use('/products', productRouter);
router.use('/discounts', discountRouter);
router.use('/users', userRouter);
router.use('/carts', cartRouter);
router.use('/orders', orderRouter);
router.use('/comments', commentRouter);

export default router;
