import express from 'express';
import createComment from './controllers/createComment.js';

const router = express.Router();

const controllers = [createComment];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
