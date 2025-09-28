import Cookies from "js-cookie";

const getCartIdFromCookie = (): string | null => {
  return Cookies.get("shopana_cart_id") || null;
};

const setCartIdCookie = (cartId: string | null): void => {
  if (!cartId) {
    Cookies.remove("shopana_cart_id");
    return;
  }

  Cookies.set("shopana_cart_id", cartId);
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
