import { connect } from '../../dbs/index.js';

export function findCommentById(commentId) {
  return connect.COMMENTS().findOne({ _id: commentId });
}

export function findAllCommentsOfProduct(productId) {}
