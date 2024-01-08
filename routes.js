import express from 'express';
import authenticationRouter from './src/api/authentication/auth.routes.js';
import productRouter from './src/api/product/product.routes.js';
import discountRouter from './src/api/discount/discount.routes.js';
import userRouter from './src/api/user/user.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.use('/auth', authenticationRouter);
router.use('/products', productRouter);
router.use('/discounts', discountRouter);
router.use('/users', userRouter);
export default router;
