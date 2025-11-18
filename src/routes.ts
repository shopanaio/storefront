export const routes = {
  home: {
    path() {
      return "/";
    },
  },
  product: {
    path(handle: string, opts?: { variant?: string | null }) {
      const base = `/product/${handle}`;
      if (opts?.variant) {
        const search = new URLSearchParams({ variant: opts.variant }).toString();
        return `${base}?${search}`;
      }
      return base;
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
  wishlist: {
    path() {
      return "/wishlist";
    },
  },
  checkout: {
    path() {
      return "/checkout";
    },
  },
};
