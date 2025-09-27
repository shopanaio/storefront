import Cookies from "js-cookie";

function getCartIdFromCookie(): string | null {
  return Cookies.get("shopify_cart_id") || null;
}

function setCartIdCookie(
  cartId: string,
  options: { maxAge?: number } = {}
): void {
  const { maxAge } = options;

  Cookies.set("shopify_cart_id", cartId, {
    path: "/",
    ...(maxAge && { expires: maxAge / (3600 * 24) }), // convert seconds → days
  });
}

function removeCartIdCookie(): void {
  Cookies.remove("shopify_cart_id");
}

function hasCart(): boolean {
  return !!Cookies.get("shopify_cart_id");
}

export default {
  getCartIdFromCookie,
  setCartIdCookie,
  removeCartIdCookie,
  hasCart,
};
