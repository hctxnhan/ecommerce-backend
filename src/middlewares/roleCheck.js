import { RBAC, Permission, Resource, UserRole } from '../api/rbac/index.js';
import { z } from 'zod';

const Schema = z.object({
  resource: z.enum(Object.values(Resource)),
  action: z.enum(Object.values(Permission))
});

export const roleCheck = (resource, action) => {
  Schema.parse({ resource, action });

  return async (req, res, next) => {
    const user = req.user;
    
    const permission = await RBAC.permission({
      role: user.role,
      resource,
      action
    });

    if (permission.granted) {
      next();
    } else {
      res.status(403).json({
        message: "You don't have permission to perform this action."
      });
    }
  };
};
