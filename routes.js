import express from 'express';
import authenticationRouter from './src/api/authentication/auth.routes.js';
import productRouter from './src/api/product/product.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.use('/auth', authenticationRouter);
router.use('/products', productRouter);

export default router;
