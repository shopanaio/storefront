export const routes = {
  home: {
    path() {
      return "/";
    },
  },
  product: {
    path(handle: string, opts?: { variant?: string | null }) {
      const base = `/products/${handle}`;
      if (opts?.variant) {
        const search = new URLSearchParams({ variant: opts.variant }).toString();
        return `${base}?${search}`;
      }
      return base;
    },
  },
  collection: {
    path(handle: string) {
      return `/collections/${handle}`;
    },
  },
  listCollections: {
    path() {
      return "/collections";
    },
  },
  search: {
    path(query?: string) {
      const base = "/search";
      if (query) {
        const search = new URLSearchParams({ q: query }).toString();
        return `${base}?${search}`;
      }
      return base;
    },
  },
  blog: {
    path() {
      return "/blogs";
    },
  },
  article: {
    path(handle: string) {
      return `/blogs/${handle}`;
    },
  },
  page: {
    path(handle: string) {
      return `/pages/${handle}`;
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
  profile: {
    path(section?: string) {
      const base = "/profile";
      if (section) {
        return `${base}/${section}`;
      }
      return base;
    },
  },
};
