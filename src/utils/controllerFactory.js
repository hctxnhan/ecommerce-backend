import { validateToken } from '../middlewares/validateRequest.js';

export default function controllerFactory() {
  const controller = {};
  return {
    method(method) {
      controller.method = method;
      return {
        path(path) {
          controller.path = path;
          return {
            handler(handler) {
              controller.handler = handler;
              return {
                middlewares(middlewares) {
                  controller.middlewares = [validateToken, ...middlewares];
                  controller.skipAuth = function () {
                    controller.middlewares = middlewares;
                    return controller;
                  };
                  return controller;
                }
              };
            }
          };
        }
      };
    }
  };
}
