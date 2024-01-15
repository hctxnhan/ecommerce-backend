import express from 'express';
import checkoutReviewController from './controllers/checkoutReview.js';

const router = express.Router();

const controllers = [checkoutReviewController];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
