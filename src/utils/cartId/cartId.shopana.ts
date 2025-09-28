import Cookies from "js-cookie";

const getCartIdFromCookie = (key: string): string | null => {
  return Cookies.get(key) || null;
};

const setCartIdCookie = (cartId: string | null, key: string): void => {
  if (!cartId) {
    Cookies.remove(key);
    return;
  }

  Cookies.set(key, cartId);
};

const removeCartIdCookie = (): void => {
  Cookies.remove("shopana_cart_id");
};

const hasCart = (): boolean => {
  return !!Cookies.get("shopana_cart_id");
};

export default {
  getCartIdFromCookie,
  setCartIdCookie,
  removeCartIdCookie,
  hasCart,
};
