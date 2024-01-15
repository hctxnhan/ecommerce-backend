import z from 'zod';
import { ObjectId } from 'mongodb';
import { connect } from '../../dbs/index.js';
import { findCommentById } from './comment.services.js';

export default class Comment {
  commentSchema = z.object({
    productId: z.string().transform((val) => new ObjectId(val)),
    userId: z.string().transform((val) => new ObjectId(val)),
    content: z.string(),
    commentParent: z
      .string()
      .optional()
      .transform((val) => new ObjectId(val)),
    isDeleted: z.boolean().default(false)
  });

  static async create(data) {
    const product = this.schema.parse(data);

    const { commentParent } = product;

    let commentLeft;
    let commentRight;

    if (commentParent) {
      const parentComment = await findCommentById(commentParent);
      if (!parentComment) {
        throw new Error('Comment parent not found');
      }

      commentLeft = parentComment.commentRight;
      commentRight = commentLeft + 1;
    } else {
      // this is a root comment, find the last commentRight
      const lastComment = await connect
        .COMMENTS()
        .find({ commentParent: null })
        .sort({ commentRight: -1 })
        .limit(1)
        .toArray();

      if (lastComment.length === 0) {
        commentLeft = 1;
        commentRight = 2;
      } else {
        commentLeft = lastComment[0].commentRight;
        commentRight = commentLeft + 1;
      }
    }

    const result = await connect.COMMENTS().insertOne({
      ...product,
      commentLeft,
      commentRight,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return result.ops[0];
  }
}
