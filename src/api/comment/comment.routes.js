import express from 'express';
import createComment from './controllers/createComment.js';
import getComment from './controllers/getComment.js';
import deleteCommentController from './controllers/deleteComment.js';

const router = express.Router();

const controllers = [createComment, getComment, deleteCommentController];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
