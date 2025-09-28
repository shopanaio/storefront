import Cookies from "js-cookie";

function getCartIdFromCookie(): string | null {
  return Cookies.get("shopify_cart_id") || null;
}

function setCartIdCookie(cartId: string | null): void {
  if (!cartId) {
    Cookies.remove("shopify_cart_id");
    return;
  }

  Cookies.set("shopify_cart_id", cartId, {
    path: "/",
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
