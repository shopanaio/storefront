import Cookies from "js-cookie";

const getCartIdFromCookie = (): string | null => {
  return Cookies.get("shopana_cart_id") || null;
};

const setCartIdCookie = (cartId: string, options: { maxAge?: number } = {}): void => {
  const { maxAge } = options;

  Cookies.set("shopana_cart_id", cartId, {
    path: "/",
    ...(maxAge && { expires: maxAge / (3600 * 24) }), // convert seconds → days
  });
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
