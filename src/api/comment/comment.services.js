import { ObjectId } from 'mongodb';
import { connect } from '../../dbs/index.js';

export function findCommentById(commentId) {
  return connect.COMMENTS().findOne({ _id: new ObjectId(commentId) });
}

export function findAllCommentsOfProduct(
  productId,
  parentCommentId,
  { page = 1, limit = 10 } = {}
) {
  return connect
    .COMMENTS()
    .aggregate([
      {
        $match: {
          productId: new ObjectId(productId),
          parentCommentId: parentCommentId
            ? new ObjectId(parentCommentId)
            : null
        }
      },
      {
        $project: {
          commentLeft: 0,
          commentRight: 0
        }
      },
      {
        $sort: {
          commentLeft: 1
        }
      },
      {
        $facet: {
          comments: [
            {
              $skip: (page - 1) * limit
            },
            {
              $limit: limit
            }
          ],
          total: [
            {
              $count: 'total'
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$total',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          comments: 1,
          total: '$total.total'
        }
      }
    ])
    .toArray();
}

export async function deleteComment(commentId) {
  const session = connect.startSession();

  try {
    session.startTransaction();

    const comment = await findCommentById(commentId);

    if (!comment) {
      return {
        success: false,
        reason: 'COMMENT_NOT_FOUND',
        message: 'Comment not found'
      };
    }

    await connect.COMMENTS().bulkWrite(
      [
        {
          deleteMany: {
            filter: {
              commentLeft: {
                $gte: comment.commentLeft,
                $lte: comment.commentRight
              }
            }
          }
        },
        {
          updateMany: {
            filter: {
              commentLeft: {
                $gt: comment.commentRight
              }
            },
            update: {
              $inc: {
                commentLeft: comment.commentLeft - comment.commentRight - 1
              }
            }
          }
        },
        {
          updateMany: {
            filter: {
              commentRight: {
                $gt: comment.commentRight
              }
            },
            update: {
              $inc: {
                commentRight: comment.commentLeft - comment.commentRight - 1
              }
            }
          }
        }
      ],
      {
        session
      }
    );

    await session.commitTransaction();

    return {
      success: true,
      message: 'Comment has been deleted'
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
