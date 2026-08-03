import { categories } from "../catalog/categories.js";
import { products } from "../catalog/products.js";
import { gid } from "../shared.js";

const imageFixture = ({ handle, alt, kind, width = 1200, height = 1200 }) => ({
  id: gid("MediaImage", `${kind}-${handle}`),
  alt,
  mediaContentType: "IMAGE",
  image: {
    id: gid("Image", `${kind}-${handle}`),
    altText: alt,
    width,
    height,
    thumbhash: null,
    url: `/images/placeholders/${kind}.svg`,
  },
  previewImage: {
    id: gid("Image", `${kind}-${handle}-preview`),
    altText: alt,
    width: 320,
    height: 320,
    thumbhash: null,
    url: `/images/placeholders/${kind}.svg`,
  },
  presentation: null,
});

export const images = [
  ...products.map(({ handle, title }) => imageFixture({ handle, alt: title, kind: "product" })),
  ...categories.map(({ handle, name }) => imageFixture({ handle, alt: name, kind: "category", width: 1600, height: 900 })),
  imageFixture({ handle: "7", alt: "Leather crossbody bag shared by a customer", kind: "review" }),
  imageFixture({ handle: "12", alt: "Portable table lamp in an outdoor dining setting", kind: "review" }),
  imageFixture({ handle: "14", alt: "Studio wireless headphones shared by a customer", kind: "review" }),
  imageFixture({ handle: "logo", alt: "Northstar Supply", kind: "brand", width: 640, height: 180 }),
  imageFixture({ handle: "square-logo", alt: "Northstar Supply monogram", kind: "brand", width: 512, height: 512 }),
  imageFixture({ handle: "cover", alt: "Northstar Supply lifestyle collection", kind: "brand", width: 1920, height: 1080 }),
];
