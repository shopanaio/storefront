import { gid } from "../shared.js";

const categoryTarget = (handle) => ({
  type: "CATEGORY",
  resourceId: gid("Category", handle),
  url: `/collections/${handle}`,
});

const pageTarget = (handle) => ({
  type: "PAGE",
  resourceId: gid("OnlineStorePage", handle),
  url: `/pages/${handle}`,
});

const item = (menuHandle, handle, label, target, children = []) => ({
  id: gid("OnlineStoreNavigationMenuItem", `${menuHandle}-${handle}`),
  label,
  target,
  openInNewTab: false,
  children,
});

const mainMenuHandle = "main-menu";
const footerMenuHandle = "footer-menu";

export const navigationMenus = [
  {
    id: gid("OnlineStoreNavigationMenu", mainMenuHandle),
    handle: mainMenuHandle,
    items: [
      item(mainMenuHandle, "new-arrivals", "New arrivals", categoryTarget("new-arrivals")),
      item(mainMenuHandle, "women", "Women", categoryTarget("women"), [
        item(mainMenuHandle, "women-clothing", "Clothing", categoryTarget("women-clothing")),
      ]),
      item(mainMenuHandle, "men", "Men", categoryTarget("men"), [
        item(mainMenuHandle, "men-clothing", "Clothing", categoryTarget("men-clothing")),
      ]),
      item(mainMenuHandle, "accessories", "Accessories", categoryTarget("accessories"), [
        item(mainMenuHandle, "bags", "Bags", categoryTarget("bags")),
        item(mainMenuHandle, "jewelry", "Jewelry & watches", categoryTarget("jewelry")),
      ]),
      item(mainMenuHandle, "home-living", "Home & living", categoryTarget("home-living"), [
        item(mainMenuHandle, "kitchen-dining", "Kitchen & dining", categoryTarget("kitchen-dining")),
        item(mainMenuHandle, "decor", "Décor", categoryTarget("decor")),
      ]),
      item(mainMenuHandle, "electronics", "Electronics", categoryTarget("electronics"), [
        item(mainMenuHandle, "audio", "Audio", categoryTarget("audio")),
        item(mainMenuHandle, "workspace", "Workspace", categoryTarget("workspace")),
      ]),
      item(mainMenuHandle, "sale", "Sale", categoryTarget("sale")),
    ],
  },
  {
    id: gid("OnlineStoreNavigationMenu", footerMenuHandle),
    handle: footerMenuHandle,
    items: [
      item(footerMenuHandle, "about", "About", pageTarget("about")),
      item(footerMenuHandle, "contact", "Contact", pageTarget("contact")),
      item(footerMenuHandle, "shipping-returns", "Shipping & returns", pageTarget("shipping-returns")),
      item(footerMenuHandle, "size-guide", "Size guide", pageTarget("size-guide")),
      item(footerMenuHandle, "care-guide", "Product care", pageTarget("care-guide")),
      item(footerMenuHandle, "privacy", "Privacy", pageTarget("privacy")),
      item(footerMenuHandle, "terms", "Terms", pageTarget("terms")),
    ],
  },
];
