export const routes = {
  home: {
    path() {
      return "/";
    },
  },
  product: {
    path(handle: string) {
      return `/product/${handle}`;
    },
  },
  category: {
    path(handle: string) {
      return `/l/${handle}`;
    },
  },
  cart: {
    path() {
      return "/cart";
    },
  },
  checkout: {
    path() {
      return "/checkout";
    },
  },
};
