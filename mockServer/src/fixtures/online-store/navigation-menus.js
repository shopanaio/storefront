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
      item(mainMenuHandle, "dogs", "Dogs", categoryTarget("dogs"), [
        item(mainMenuHandle, "dog-food", "Food & treats", categoryTarget("dog-food")),
      ]),
      item(mainMenuHandle, "cats", "Cats", categoryTarget("cats"), [
        item(mainMenuHandle, "cat-food", "Food & treats", categoryTarget("cat-food")),
      ]),
      item(mainMenuHandle, "walking", "Walking", categoryTarget("walking"), [
        item(mainMenuHandle, "collars-leashes", "Collars & leashes", categoryTarget("collars-leashes")),
        item(mainMenuHandle, "identification", "Pet identification", categoryTarget("identification")),
      ]),
      item(mainMenuHandle, "feeding", "Feeding", categoryTarget("feeding"), [
        item(mainMenuHandle, "bowls-feeders", "Bowls & feeders", categoryTarget("bowls-feeders")),
        item(mainMenuHandle, "beds-comfort", "Beds & comfort", categoryTarget("beds-comfort")),
      ]),
      item(mainMenuHandle, "smart-pet", "Smart pet", categoryTarget("smart-pet"), [
        item(mainMenuHandle, "trackers-cameras", "Trackers & cameras", categoryTarget("trackers-cameras")),
        item(mainMenuHandle, "automatic-care", "Automatic care", categoryTarget("automatic-care")),
      ]),
      item(mainMenuHandle, "travel", "Travel", categoryTarget("travel")),
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
      item(footerMenuHandle, "size-guide", "Pet size guide", pageTarget("size-guide")),
      item(footerMenuHandle, "care-guide", "Pet care guide", pageTarget("care-guide")),
      item(footerMenuHandle, "privacy", "Privacy", pageTarget("privacy")),
      item(footerMenuHandle, "terms", "Terms", pageTarget("terms")),
    ],
  },
];
