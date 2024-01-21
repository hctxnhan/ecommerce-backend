import { ObjectId } from 'mongodb';
import { connect } from '../../services/dbs/index.js';
import { SortDirection } from '../../utils/enum/index.js';

export function findProducts(
  options,
  {
    search = '',
    page = 1,
    limit = 10,
    sort = {
      createdAt: SortDirection.DESC
    }
  } = {}
) {
  const skip = (page - 1) * limit;

  let pipeline = [];

  if (search) {
    pipeline = [
      {
        $search: {
          search: {
            query: search,
            path: ['name', 'description']
          }
        }
      }
    ];
  }

  pipeline.push(
    ...[
      {
        $match: options
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          description: 1,
          isPublished: 1,
          createdAt: 1,
          updatedAt: 1,
          avgRating: 1,
          slug: 1,
          type: 1,
          owner: {
            $arrayElemAt: ['$owner', 0]
          },
          score: {
            $meta: 'searchScore'
          }
        }
      },
      {
        $project: {
          'owner.password': 0,
          'owner.email': 0,
          'owner.role': 0
        }
      },
      {
        $sort: {
          score: 1,
          ...sort
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]
  );

  return connect.PRODUCTS().aggregate(pipeline);
}

export function findProductById(id) {
  const pipeline = [
    {
      $match: {
        _id: new ObjectId(id),
        isPublished: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        description: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        avgRating: 1,
        slug: 1,
        type: 1,
        attributes: 1,
        owner: {
          $arrayElemAt: ['$owner', 0]
        }
      }
    },
    {
      $project: {
        'owner.password': 0,
        'owner.email': 0,
        'owner.role': 0
      }
    }
  ];

  return connect.PRODUCTS().aggregate(pipeline).limit(1).next();
}

export function doesUserOwnProduct(userId, productId) {
  return connect.PRODUCTS().findOne({
    _id: new ObjectId(productId),
    owner: new ObjectId(userId)
  });
}

export function updateProductById(id, update) {
  return connect
    .PRODUCTS()
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnOriginal: false }
    );
}
