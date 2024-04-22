import { AccessControl } from 'accesscontrol';

const AC = new AccessControl();

// 3 roles: admin, user, shopOwner
// 3 resources: cart, comment, discount, order, inventory, product, user, shopDetail

const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  SHOP_OWNER: 'shopOwner'
};

const Resource = {
  CART: 'cart',
  COMMENT: 'comment',
  DISCOUNT: 'discount',
  ORDER: 'order',
  INVENTORY: 'inventory',
  PRODUCT: 'product',
  USER: 'user',
  SHOP_REQUEST: 'shopRequest'
};

const Permission = {
  CREATE_ANY: 'create:any',
  READ_ANY: 'read:any',
  UPDATE_ANY: 'update:any',
  DELETE_ANY: 'delete:any',
  CREATE_OWN: 'create:own',
  READ_OWN: 'read:own',
  UPDATE_OWN: 'update:own',
  DELETE_OWN: 'delete:own'
};

let grantsObject = {
  [UserRole.USER]: {
    [Resource.USER]: {
      [Permission.READ_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*']
    },
    [Resource.CART]: {
      [Permission.CREATE_OWN]: ['*'],
      [Permission.READ_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*'],
      [Permission.DELETE_OWN]: ['*']
    },
    [Resource.COMMENT]: {
      [Permission.CREATE_OWN]: ['*'],
      [Permission.READ_ANY]: ['*'],
      [Permission.UPDATE_OWN]: ['*'],
      [Permission.DELETE_OWN]: ['*']
    },
    [Resource.DISCOUNT]: {
      [Permission.READ_ANY]: ['*']
    },
    [Resource.ORDER]: {
      [Permission.CREATE_OWN]: ['*'],
      [Permission.READ_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*'],
      [Permission.DELETE_OWN]: ['*']
    },
    [Resource.INVENTORY]: {
      [Permission.READ_ANY]: ['*']
    },
    [Resource.PRODUCT]: {
      [Permission.READ_ANY]: ['*']
    },
    [Resource.SHOP_REQUEST]: {
      [Permission.CREATE_OWN]: ['*'],
      [Permission.READ_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*'],
      [Permission.DELETE_OWN]: ['*']
    }
  },
  [UserRole.SHOP_OWNER]: {
    [Resource.USER]: {
      [Permission.READ_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*', '!role', '!rating']
    },
    [Resource.CART]: {
      [Permission.CREATE_OWN]: ['*'],
      [Permission.READ_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*'],
      [Permission.DELETE_OWN]: ['*']
    },
    [Resource.COMMENT]: {
      [Permission.READ_ANY]: ['*']
    },
    [Resource.DISCOUNT]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.CREATE_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*'],
      [Permission.DELETE_OWN]: ['*']
    },
    [Resource.ORDER]: {
      [Permission.READ_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*']
    },
    [Resource.INVENTORY]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.CREATE_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*'],
      [Permission.DELETE_OWN]: ['*']
    },
    [Resource.PRODUCT]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.CREATE_OWN]: ['*'],
      [Permission.UPDATE_OWN]: ['*', '!ownerId', '!rating'],
      [Permission.DELETE_OWN]: ['*']
    }
  },
  [UserRole.ADMIN]: {
    [Resource.USER]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.UPDATE_ANY]: ['*'],
      [Permission.DELETE_ANY]: ['*'],
      [Permission.CREATE_ANY]: ['*']
    },
    [Resource.COMMENT]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.DELETE_ANY]: ['*']
    },
    [Resource.DISCOUNT]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.DELETE_ANY]: ['*']
    },
    [Resource.ORDER]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.DELETE_ANY]: ['*']
    },
    [Resource.INVENTORY]: {
      [Permission.READ_ANY]: ['*']
    },
    [Resource.PRODUCT]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.DELETE_ANY]: ['*']
    },
    [Resource.SHOP_REQUEST]: {
      [Permission.READ_ANY]: ['*'],
      [Permission.UPDATE_ANY]: ['*']
    }
  }
};

AC.setGrants(grantsObject).lock();

export { AC as RBAC, UserRole, Resource, Permission };
