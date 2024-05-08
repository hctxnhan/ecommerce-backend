import z from 'zod';
import { ObjectId } from 'mongodb';
import { connect } from '../../services/dbs/index.js';
import { findCommentById, hasRating } from './comment.services.js';
import { findProductById } from '../product/product.services.js';
import { ISODateNow, toObjectId } from '../../utils/index.js';
import { getOrderItem } from '../order/order.services.js';

export default class Comment {
  static commentSchema = z
    .object({
      productId: z.string().transform((val) => new ObjectId(val)),
      orderItemId: z.string().optional(),
      userId: z.string().transform((val) => new ObjectId(val)),
      content: z.string(),
      rating: z.number().int().min(1).max(5).optional(),
      parentCommentId: z
        .string()
        .optional()
        .transform((val) => (val ? new ObjectId(val) : null)),
      isDeleted: z.boolean().default(false)
    })
    .refine((data) => !(data.rating && data.parentCommentId), {
      message: 'Rating should not be a reply to another comment.',
      path: ['rating']
    });

  static async create(data) {
    const commentProduct = await findProductById(data.productId);

    if (!commentProduct) {
      return {
        success: false,
        reason: 'PRODUCT_NOT_FOUND',
        message: 'Product not found'
      };
    }
    const alreadyCommented = await hasRating(data.orderItemId, data.userId);
    if (alreadyCommented) {
      return {
        success: false,
        reason: 'ALREADY_COMMENTED',
        message: 'You have already rate this product'
      };
    }

    if (data.orderItemId) {
      const orderItem = await getOrderItem(data.orderItemId);
      if (!orderItem) {
        return {
          success: false,
          reason: 'ORDER_ITEM_NOT_FOUND',
          message:
            'You must not rate a comment on a product that you have not purchased'
        };
      }
    }

    const comment = Comment.commentSchema.parse(data);

    const { parentCommentId } = comment;

    let commentLeft;
    let commentRight;

    const session = await connect.startSession();

    try {
      session.startTransaction();

      if (parentCommentId) {
        const parentComment = await findCommentById(parentCommentId.toString());
        if (!parentComment) {
          return {
            success: false,
            reason: 'COMMENT_PARENT_NOT_FOUND',
            message: 'Comment parent not found'
          };
        }

        await connect.COMMENTS().bulkWrite([
          {
            updateMany: {
              filter: { commentLeft: { $gt: parentComment.commentRight } },
              update: { $inc: { commentLeft: 2 } }
            }
          },
          {
            updateMany: {
              filter: { commentRight: { $gte: parentComment.commentRight } },
              update: { $inc: { commentRight: 2 } }
            }
          }
        ]);

        commentLeft = parentComment.commentRight;
        commentRight = commentLeft + 1;
      } else {
        // this is a root comment, find the last commentRight
        const lastComment = await connect
          .COMMENTS()
          .find(
            { parentCommentId: null },
            {
              session
            }
          )
          .sort({ commentRight: -1 })
          .limit(1)
          .toArray();

        if (lastComment.length === 0) {
          commentLeft = 1;
          commentRight = 2;
        } else {
          commentLeft = lastComment[0].commentRight + 1;
          commentRight = commentLeft + 1;
        }
      }

      const user = await connect.USERS().findOne(
        { _id: comment.userId },
        {
          projection: { _id: 1, name: 1 },
          session
        }
      );

      const result = await connect.COMMENTS().insertOne(
        {
          ...comment,
          orderItemId: comment.orderItemId
            ? toObjectId(comment.orderItemId)
            : null,
          userId: user._id,
          userName: user.name,
          commentLeft,
          commentRight,
          createdAt: ISODateNow(),
          updatedAt: ISODateNow()
        },
        {
          session
        }
      );

      await connect
        .ORDER_ITEMS()
        .updateOne(
          { _id: toObjectId(data.orderItemId) },
          { $set: { reviewId: toObjectId(result.insertedId) } },
          { session }
        );

      await session.commitTransaction();

      return {
        success: true,
        result
      };
    } catch (err) {
      return {
        success: false,
        reason: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong'
      };
    } finally {
      session.endSession();
    }
  }

  static async update(commentId, data) {
    const updateSchema = Comment.commentSchema
      .partial()
      .pick({
        content: true,
        isDeleted: true
      })
      .extend({
        commentLeft: z.number().optional(),
        commentRight: z.number().optional()
      });

    const updateData = updateSchema.parse(data);

    const result = await connect
      .COMMENTS()
      .updateOne({ _id: new ObjectId(commentId) }, { $set: updateData });

    return result;
  }
}
