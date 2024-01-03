import express from 'express';
import authenticationRouter from './src/api/authentication/auth.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.use('/auth', authenticationRouter);

export default router;
