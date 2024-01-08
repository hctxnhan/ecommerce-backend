/* eslint max-classes-per-file: 0 */

import slugify from 'slugify';
import z from 'zod';

export const ProductType = {
  ELECTRONICS: 'electronics',
  CLOTHES: 'clothes',
  FURNITURE: 'furniture'
};

const CommonProductSchema = z.object({
  name: z.string(),
  thumbnail: z.string().optional(),
  price: z.number(),
  description: z.string().optional(),
  variation: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  type: z.enum(Object.values(ProductType)),
  stock: z.number().default(0)
});

class Product {
  constructor(data) {
    this.name = data.name;
    this.thumbnail = data.thumbnail;
    this.price = data.price;
    this.sold = data.sold;
    this.description = data.description;
    this.type = data.type;
    this.slug = slugify(`${data.name} ${new Date().getTime()}`, {
      lower: true
    });
    this.variation = data.variation;
    this.isPublished = data.isPublished;
    this.stock = data.stock;
    this.avgRating = 0;
  }
}

export class ElectronicsProduct extends Product {
  static schema = CommonProductSchema.extend({
    type: z.enum([ProductType.ELECTRONICS]),
    attributes: z.object({
      manufacturer: z.string(),
      model: z.string(),
      color: z.string(),
      dimensions: z.string(),
      weight: z.string()
    })
  }).strict();

  constructor(data) {
    super(data);
    this.attributes = data.attributes;
  }
}

export class ClothesProduct extends Product {
  static schema = CommonProductSchema.extend({
    type: z.enum([ProductType.CLOTHES]),
    attributes: z.object({
      brand: z.string(),
      size: z.string(),
      color: z.string(),
      material: z.string()
    })
  }).strict();

  constructor(data) {
    super(data);
    this.attributes = data.attributes;
  }
}

export class FurnitureProduct extends Product {
  static schema = CommonProductSchema.extend({
    type: z.enum([ProductType.FURNITURE]),
    attributes: z.object({
      brand: z.string(),
      size: z.string(),
      color: z.string(),
      material: z.string()
    })
  }).strict();

  constructor(data) {
    super(data);
    this.attributes = data.attributes;
  }
}

const mapTypeToClass = {
  [ProductType.ELECTRONICS]: ElectronicsProduct,
  [ProductType.CLOTHES]: ClothesProduct,
  [ProductType.FURNITURE]: FurnitureProduct
};

export function productFactory(data) {
  const ProductClass = mapTypeToClass[data.type];
  if (!ProductClass) {
    throw new Error('Invalid product type');
  }

  const result = ProductClass.schema.parse(data);
  return new ProductClass(result);
}

export function updateProductFactory(data) {
  const ProductClass = mapTypeToClass[data.type];
  if (!ProductClass) {
    throw new Error('Invalid product type');
  }

  const result = ProductClass.schema
    .deepPartial()
    .omit(
      'type',
      'slug',
      'isPublished',
      'createdAt',
      'updatedAt',
      'avgRating',
      'sold',
      '_id'
    )
    .strict()
    .parse(data);
  return result;
}
