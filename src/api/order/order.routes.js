import express from 'express';
import checkoutReviewController from './controllers/checkoutReview.js';
import checkoutController from './controllers/checkout.js';
import getMyOrders from './controllers/getMyOrders.js';
import getOrdersDetail from './controllers/getOrderDetail.js';
import changeOrderStatus from './controllers/changeOrderStatus.js';
import updateDeliveryAddress from './controllers/updateDeliveryAddress.js';
import cancelOrder from './controllers/cancelOrder.js';
import getShopOrderItem from './controllers/getShopOrderItem.js';
import findOrderItem from './controllers/findOrderItem.js';

const router = express.Router();

const controllers = [
  checkoutReviewController,
  checkoutController,
  getMyOrders,
  getShopOrderItem,
  getOrdersDetail,
  changeOrderStatus,
  updateDeliveryAddress,
  cancelOrder,
  findOrderItem
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
