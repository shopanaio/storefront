import { FIXTURE_NOW, gid, money, richText } from "../shared.js";

const colorVariants = (sku, price, colors, compareAtPrice = null) =>
  colors.map(([name, color], index) => ({
    name,
    color,
    sku: `${sku}-${name.toUpperCase().replaceAll(" ", "-")}`,
    price,
    compareAtPrice,
    quantity: 6 + ((index * 7 + sku.length) % 19),
  }));

const sizeVariants = (sku, price, sizes, compareAtPrice = null) =>
  sizes.map((name, index) => ({
    name,
    sku: `${sku}-${name.toUpperCase()}`,
    price,
    compareAtPrice,
    quantity: 7 + ((index * 5 + sku.length) % 16),
  }));

const coreProductDefinitions = [
  {
    handle: "essential-cotton-tee",
    title: "Essential Cotton Tee",
    categoryHandles: ["women", "women-clothing", "new-arrivals"],
    vendor: "Northstar Basics",
    description: "A softly structured everyday tee made from heavyweight organic cotton.",
    tags: ["organic", "bestseller", "everyday"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("NST-TEE", 32, [["Cloud", "#F3F1E8"], ["Ink", "#20242A"], ["Sage", "#81917A"]]),
  },
  {
    handle: "relaxed-linen-shirt",
    title: "Relaxed Linen Shirt",
    categoryHandles: ["women", "women-clothing", "new-arrivals"],
    vendor: "Aster Studio",
    description: "A breathable linen shirt with an easy fit and subtle shell buttons.",
    tags: ["linen", "summer", "natural-fibers"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("AST-LIN", 78, ["XS", "S", "M", "L"]),
  },
  {
    handle: "weekend-knit-cardigan",
    title: "Weekend Knit Cardigan",
    categoryHandles: ["women", "women-clothing"],
    vendor: "Aster Studio",
    description: "A midweight cardigan knitted with a soft wool blend for year-round layering.",
    tags: ["knitwear", "layering", "wool-blend"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("AST-CAR", 108, ["XS", "S", "M", "L"], 135)
      .map((variant) => variant.name === "L" ? { ...variant, quantity: 0 } : variant),
  },
  {
    handle: "tailored-wide-leg-trouser",
    title: "Tailored Wide-Leg Trouser",
    categoryHandles: ["women", "women-clothing"],
    vendor: "Aster Studio",
    description: "Polished wide-leg trousers with a comfortable high rise and fluid drape.",
    tags: ["tailored", "workwear", "bestseller"],
    optionName: "Size",
    optionDisplayType: "DROPDOWN",
    variants: sizeVariants("AST-TRS", 96, ["2", "4", "6", "8", "10"]),
  },
  {
    handle: "classic-oxford-shirt",
    title: "Classic Oxford Shirt",
    categoryHandles: ["men", "men-clothing", "new-arrivals"],
    vendor: "Northstar Basics",
    description: "A durable cotton Oxford shirt cut for a relaxed but tidy silhouette.",
    tags: ["cotton", "workwear", "classic"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("NST-OXF", 72, ["S", "M", "L", "XL"]),
  },
  {
    handle: "everyday-loopback-hoodie",
    title: "Everyday Loopback Hoodie",
    categoryHandles: ["men", "men-clothing"],
    vendor: "Northstar Basics",
    description: "A substantial loopback-cotton hoodie with clean details and a relaxed fit.",
    tags: ["cotton", "weekend", "unisex"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("NST-HDY", 84, [["Heather", "#B9BAB5"], ["Navy", "#26364A"], ["Clay", "#A6674D"]]),
  },
  {
    handle: "selvedge-denim-jacket",
    title: "Selvedge Denim Jacket",
    categoryHandles: ["men", "men-clothing"],
    vendor: "Foundry Garments",
    description: "A timeless trucker jacket cut from rinsed selvedge denim that softens with wear.",
    tags: ["denim", "outerwear", "durable"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("FND-DNM", 148, ["S", "M", "L", "XL"]),
  },
  {
    handle: "weatherproof-field-jacket",
    title: "Weatherproof Field Jacket",
    categoryHandles: ["men", "men-clothing", "outdoors", "sale"],
    vendor: "Field & Coast",
    description: "A lightweight water-resistant shell with practical pockets and a packable hood.",
    tags: ["outerwear", "water-resistant", "travel"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("FCO-FLD", 132, ["S", "M", "L", "XL"], 165),
  },
  {
    handle: "leather-crossbody-bag",
    title: "Leather Crossbody Bag",
    categoryHandles: ["accessories", "bags", "new-arrivals"],
    vendor: "Morrow Leather",
    description: "A compact vegetable-tanned leather bag with an adjustable strap and secure zip.",
    tags: ["leather", "handmade", "travel"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("MRW-XBD", 124, [["Cognac", "#9B5D37"], ["Black", "#1E1E1E"]]),
  },
  {
    handle: "market-canvas-tote",
    title: "Market Canvas Tote",
    categoryHandles: ["accessories", "bags"],
    vendor: "Northstar Basics",
    description: "An oversized recycled-canvas carryall with reinforced handles and an inner pocket.",
    tags: ["recycled", "everyday", "giftable"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("NST-TOT", 42, [["Natural", "#E8DFC9"], ["Olive", "#59624A"]]),
  },
  {
    handle: "commuter-backpack",
    title: "Commuter Backpack",
    categoryHandles: ["accessories", "bags", "outdoors"],
    vendor: "Field & Coast",
    description: "A weather-resistant 22-liter backpack with a padded laptop sleeve and luggage pass-through.",
    tags: ["travel", "water-resistant", "laptop"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("FCO-CMT", 118, [["Graphite", "#3A3E42"], ["Forest", "#3E5143"]]),
  },
  {
    handle: "minimalist-field-watch",
    title: "Minimalist Field Watch",
    categoryHandles: ["accessories", "jewelry"],
    vendor: "Common Time",
    description: "A clean 38 mm field watch with sapphire crystal and a quick-release strap.",
    tags: ["watch", "giftable", "unisex"],
    optionName: "Strap",
    optionDisplayType: "DROPDOWN",
    variants: colorVariants("CMT-FLD", 189, [["Tan Leather", "#A46D43"], ["Black Nylon", "#242424"]]),
  },
  {
    handle: "silver-hoop-earrings",
    title: "Silver Hoop Earrings",
    categoryHandles: ["accessories", "jewelry"],
    vendor: "Stillform",
    description: "Lightweight recycled sterling-silver hoops polished to a mirror finish.",
    tags: ["silver", "recycled", "giftable"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("STL-HOP", 58, ["Small", "Medium"]),
  },
  {
    handle: "polarized-acetate-sunglasses",
    title: "Polarized Acetate Sunglasses",
    primaryCategoryHandle: "accessories",
    categoryHandles: ["accessories", "new-arrivals"],
    vendor: "Stillform",
    description: "Hand-finished acetate frames with scratch-resistant polarized lenses.",
    tags: ["summer", "polarized", "unisex"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("STL-SUN", 92, [["Tortoise", "#6A4933"], ["Black", "#171717"], ["Moss", "#596251"]])
      .map((variant) => variant.name === "Moss" ? { ...variant, quantity: 0 } : variant),
  },
  {
    handle: "stoneware-mug-set",
    title: "Stoneware Mug Set",
    categoryHandles: ["home-living", "kitchen-dining"],
    vendor: "Hearthline",
    description: "A set of four hand-glazed stoneware mugs, each with subtle natural variation.",
    tags: ["ceramic", "handmade", "giftable"],
    optionName: "Glaze",
    optionDisplayType: "SWATCH",
    variants: colorVariants("HTH-MUG", 64, [["Oat", "#D9CDB5"], ["Slate", "#667078"]]),
  },
  {
    handle: "acacia-serving-board",
    title: "Acacia Serving Board",
    categoryHandles: ["home-living", "kitchen-dining"],
    vendor: "Hearthline",
    description: "A solid acacia board shaped for prep, serving, and easy hanging storage.",
    tags: ["wood", "kitchen", "giftable"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("HTH-BRD", 48, ["Medium", "Large"]),
  },
  {
    handle: "insulated-travel-bottle",
    title: "Insulated Travel Bottle",
    categoryHandles: ["home-living", "kitchen-dining", "outdoors"],
    vendor: "Field & Coast",
    description: "A leakproof stainless-steel bottle that keeps drinks cold for 24 hours.",
    tags: ["stainless-steel", "travel", "reusable"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("FCO-BTL", 38, [["Sea", "#6C9295"], ["Sand", "#C8B79B"], ["Ink", "#252B31"]]),
  },
  {
    handle: "washed-linen-throw",
    title: "Washed Linen Throw",
    categoryHandles: ["home-living", "decor", "sale"],
    vendor: "Hearthline",
    description: "A soft garment-washed linen throw finished with hand-knotted fringe.",
    tags: ["linen", "textile", "natural-fibers"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("HTH-THR", 88, [["Flax", "#C9B899"], ["Rust", "#9A5845"]], 110),
  },
  {
    handle: "portable-table-lamp",
    title: "Portable Table Lamp",
    categoryHandles: ["home-living", "decor", "electronics", "workspace"],
    vendor: "Luma Works",
    description: "A dimmable rechargeable lamp that brings warm light to any corner or table.",
    tags: ["lighting", "rechargeable", "bestseller"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("LMW-PTL", 79, [["Chalk", "#E5E0D5"], ["Ochre", "#C78A32"], ["Charcoal", "#414141"]]),
  },
  {
    handle: "cedar-amber-candle",
    title: "Cedar & Amber Candle",
    categoryHandles: ["home-living", "decor"],
    vendor: "Quiet Hours",
    description: "A clean-burning soy candle with cedar, amber, and a hint of bergamot.",
    tags: ["candle", "soy-wax", "giftable"],
    optionName: "Size",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("QHR-CND", 34, ["8 oz", "12 oz"]),
  },
  {
    handle: "studio-wireless-headphones",
    title: "Studio Wireless Headphones",
    categoryHandles: ["electronics", "audio", "new-arrivals"],
    vendor: "Signal Audio",
    description: "Comfortable over-ear headphones with active noise cancellation and 40-hour battery life.",
    tags: ["wireless", "noise-cancelling", "travel"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("SGN-HDP", 229, [["Midnight", "#20242B"], ["Stone", "#C8C3B8"]]),
  },
  {
    handle: "mini-bluetooth-speaker",
    title: "Mini Bluetooth Speaker",
    categoryHandles: ["electronics", "audio"],
    vendor: "Signal Audio",
    description: "A palm-sized water-resistant speaker with full sound and 16 hours of playtime.",
    tags: ["wireless", "portable", "water-resistant"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("SGN-SPK", 69, [["Cobalt", "#315A91"], ["Coral", "#D86E5B"], ["Black", "#242424"]]),
  },
  {
    handle: "low-profile-mechanical-keyboard",
    title: "Low-Profile Mechanical Keyboard",
    categoryHandles: ["electronics", "workspace"],
    vendor: "Common Office",
    description: "A compact wireless keyboard with quiet tactile switches and multi-device pairing.",
    tags: ["wireless", "desk", "productivity"],
    optionName: "Layout",
    optionDisplayType: "BUTTONS",
    variants: sizeVariants("CMO-KEY", 139, ["US", "UK"]),
  },
  {
    handle: "adjustable-desk-lamp",
    title: "Adjustable Desk Lamp",
    categoryHandles: ["electronics", "workspace", "home-living", "decor"],
    vendor: "Luma Works",
    description: "An articulated LED desk lamp with warm-to-cool light and touch dimming.",
    tags: ["lighting", "desk", "led"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("LMW-DSL", 109, [["Black", "#232323"], ["White", "#E9E7E0"]]),
  },
  {
    handle: "natural-rubber-yoga-mat",
    title: "Natural Rubber Yoga Mat",
    primaryCategoryHandle: "outdoors",
    categoryHandles: ["outdoors", "new-arrivals"],
    vendor: "Field & Coast",
    description: "A supportive natural-rubber mat with a grippy, easy-clean surface.",
    tags: ["fitness", "natural-rubber", "wellness"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("FCO-YOG", 74, [["Juniper", "#5C7463"], ["Terracotta", "#B7654F"]]),
  },
  {
    handle: "packable-picnic-blanket",
    title: "Packable Picnic Blanket",
    primaryCategoryHandle: "outdoors",
    categoryHandles: ["outdoors", "sale"],
    vendor: "Field & Coast",
    description: "A water-resistant quilted blanket that folds into its own carry pouch.",
    tags: ["outdoors", "travel", "water-resistant"],
    optionName: "Color",
    optionDisplayType: "SWATCH",
    variants: colorVariants("FCO-PIC", 56, [["Meadow", "#65735A"], ["Sunset", "#C77B62"]], 70),
  },
];

const supplementalCollections = [
  { handle: "alpine", name: "Alpine", colors: [["Glacier", "#DDE7E7"], ["Pine", "#39564A"]] },
  { handle: "coastal", name: "Coastal", colors: [["Seafoam", "#91B8AF"], ["Navy", "#26364A"]] },
  { handle: "desert", name: "Desert", colors: [["Sand", "#CDBA9C"], ["Terracotta", "#B7644D"]] },
  { handle: "forest", name: "Forest", colors: [["Moss", "#69745B"], ["Bark", "#684D3C"]] },
  { handle: "harbor", name: "Harbor", colors: [["Fog", "#BCC2BE"], ["Ink", "#252D35"]] },
  { handle: "meadow", name: "Meadow", colors: [["Sage", "#82967C"], ["Poppy", "#C85E4B"]] },
  { handle: "studio", name: "Studio", colors: [["Chalk", "#E6E1D7"], ["Graphite", "#42474A"]] },
  { handle: "trail", name: "Trail", colors: [["Stone", "#918B80"], ["Ember", "#A9533E"]] },
];

const supplementalProductTemplates = [
  {
    handle: "pleated-midi-skirt", title: "Pleated Midi Skirt", categoryHandles: ["women", "women-clothing"],
    primaryCategoryHandle: "women-clothing", vendor: "Aster Studio", price: 86, sized: true,
    description: "A fluid pleated skirt with a comfortable waistband and easy movement.", tags: ["women", "everyday"],
  },
  {
    handle: "wrap-day-dress", title: "Wrap Day Dress", categoryHandles: ["women", "women-clothing"],
    primaryCategoryHandle: "women-clothing", vendor: "Aster Studio", price: 118, sized: true,
    description: "A versatile wrap dress cut from softly draped, easy-care fabric.", tags: ["women", "dress"],
  },
  {
    handle: "ribbed-tank-top", title: "Ribbed Tank Top", categoryHandles: ["women", "women-clothing"],
    primaryCategoryHandle: "women-clothing", vendor: "Northstar Basics", price: 34, sized: true,
    description: "A close-fitting ribbed tank made for layering or wearing on its own.", tags: ["women", "layering"],
  },
  {
    handle: "relaxed-blazer", title: "Relaxed Blazer", categoryHandles: ["women", "women-clothing"],
    primaryCategoryHandle: "women-clothing", vendor: "Aster Studio", price: 154, sized: true,
    description: "An unstructured blazer with clean tailoring and a relaxed modern fit.", tags: ["women", "workwear"],
  },
  {
    handle: "canvas-chore-coat", title: "Canvas Chore Coat", categoryHandles: ["men", "men-clothing"],
    primaryCategoryHandle: "men-clothing", vendor: "Foundry Garments", price: 126, sized: true,
    description: "A durable cotton-canvas layer with roomy utility pockets.", tags: ["men", "outerwear"],
  },
  {
    handle: "merino-crewneck", title: "Merino Crewneck", categoryHandles: ["men", "men-clothing"],
    primaryCategoryHandle: "men-clothing", vendor: "Northstar Basics", price: 98, sized: true,
    description: "A fine-gauge merino sweater that regulates temperature across seasons.", tags: ["men", "merino"],
  },
  {
    handle: "tapered-chino", title: "Tapered Chino", categoryHandles: ["men", "men-clothing"],
    primaryCategoryHandle: "men-clothing", vendor: "Northstar Basics", price: 82, sized: true,
    description: "Stretch-cotton chinos with a clean taper and comfortable mid rise.", tags: ["men", "workwear"],
  },
  {
    handle: "camp-collar-shirt", title: "Camp Collar Shirt", categoryHandles: ["men", "men-clothing"],
    primaryCategoryHandle: "men-clothing", vendor: "Foundry Garments", price: 68, sized: true,
    description: "A breezy short-sleeve shirt with an open camp collar.", tags: ["men", "summer"],
  },
  {
    handle: "weekender-duffel", title: "Weekender Duffel", categoryHandles: ["accessories", "bags", "outdoors"],
    primaryCategoryHandle: "bags", vendor: "Field & Coast", price: 138,
    description: "A structured carry-on duffel with separate shoe and laptop compartments.", tags: ["bags", "travel"],
  },
  {
    handle: "zip-travel-pouch", title: "Zip Travel Pouch", categoryHandles: ["accessories", "bags"],
    primaryCategoryHandle: "bags", vendor: "Morrow Leather", price: 44,
    description: "A compact organizer for cables, toiletries, and small daily essentials.", tags: ["bags", "organization"],
  },
  {
    handle: "everyday-sling-bag", title: "Everyday Sling Bag", categoryHandles: ["accessories", "bags"],
    primaryCategoryHandle: "bags", vendor: "Field & Coast", price: 76,
    description: "A lightweight crossbody sling with quick-access pockets and an adjustable strap.", tags: ["bags", "everyday"],
  },
  {
    handle: "chain-bracelet", title: "Chain Bracelet", categoryHandles: ["accessories", "jewelry"],
    primaryCategoryHandle: "jewelry", vendor: "Stillform", price: 72, sized: true,
    description: "A refined recycled-metal bracelet with a secure low-profile clasp.", tags: ["jewelry", "giftable"],
  },
  {
    handle: "pendant-necklace", title: "Pendant Necklace", categoryHandles: ["accessories", "jewelry"],
    primaryCategoryHandle: "jewelry", vendor: "Stillform", price: 84,
    description: "A minimal pendant on an adjustable fine chain for effortless layering.", tags: ["jewelry", "giftable"],
  },
  {
    handle: "classic-chronograph", title: "Classic Chronograph", categoryHandles: ["accessories", "jewelry"],
    primaryCategoryHandle: "jewelry", vendor: "Common Time", price: 248,
    description: "A balanced chronograph with a precise quartz movement and sapphire crystal.", tags: ["watch", "giftable"],
  },
  {
    handle: "dinner-plate-set", title: "Dinner Plate Set", categoryHandles: ["home-living", "kitchen-dining"],
    primaryCategoryHandle: "kitchen-dining", vendor: "Hearthline", price: 78,
    description: "Four durable stoneware dinner plates with a softly irregular rim.", tags: ["tableware", "ceramic"],
  },
  {
    handle: "linen-napkin-set", title: "Linen Napkin Set", categoryHandles: ["home-living", "kitchen-dining"],
    primaryCategoryHandle: "kitchen-dining", vendor: "Hearthline", price: 46,
    description: "A set of four washed-linen napkins finished with neat mitered corners.", tags: ["linen", "tableware"],
  },
  {
    handle: "forged-chef-knife", title: "Forged Chef Knife", categoryHandles: ["home-living", "kitchen-dining"],
    primaryCategoryHandle: "kitchen-dining", vendor: "Hearthline", price: 132, sized: true,
    description: "A balanced forged-steel chef knife with a comfortable hardwood handle.", tags: ["kitchen", "cooking"],
  },
  {
    handle: "glass-water-carafe", title: "Glass Water Carafe", categoryHandles: ["home-living", "kitchen-dining"],
    primaryCategoryHandle: "kitchen-dining", vendor: "Hearthline", price: 52,
    description: "A hand-blown glass carafe designed for water, juice, or table wine.", tags: ["glassware", "tableware"],
  },
  {
    handle: "wool-cushion-cover", title: "Wool Cushion Cover", categoryHandles: ["home-living", "decor"],
    primaryCategoryHandle: "decor", vendor: "Quiet Hours", price: 58,
    description: "A textural wool-blend cushion cover with a concealed zip closure.", tags: ["textile", "decor"],
  },
  {
    handle: "sculpted-ceramic-vase", title: "Sculpted Ceramic Vase", categoryHandles: ["home-living", "decor"],
    primaryCategoryHandle: "decor", vendor: "Quiet Hours", price: 74,
    description: "A sculptural ceramic vessel that works equally well with stems or alone.", tags: ["ceramic", "decor"],
  },
  {
    handle: "true-wireless-earbuds", title: "True Wireless Earbuds", categoryHandles: ["electronics", "audio"],
    primaryCategoryHandle: "audio", vendor: "Signal Audio", price: 149,
    description: "Compact noise-cancelling earbuds with clear calls and all-day battery life.", tags: ["wireless", "audio"],
  },
  {
    handle: "compact-bookshelf-speaker", title: "Compact Bookshelf Speaker", categoryHandles: ["electronics", "audio"],
    primaryCategoryHandle: "audio", vendor: "Signal Audio", price: 219,
    description: "A compact powered speaker with balanced sound and simple wireless streaming.", tags: ["speaker", "audio"],
  },
  {
    handle: "ergonomic-wireless-mouse", title: "Ergonomic Wireless Mouse", categoryHandles: ["electronics", "workspace"],
    primaryCategoryHandle: "workspace", vendor: "Common Office", price: 79,
    description: "A quiet multi-device mouse shaped for comfortable all-day use.", tags: ["wireless", "productivity"],
  },
  {
    handle: "felt-desk-mat", title: "Felt Desk Mat", categoryHandles: ["electronics", "workspace"],
    primaryCategoryHandle: "workspace", vendor: "Common Office", price: 48,
    description: "A dense recycled-felt surface that protects the desk and keeps accessories organized.", tags: ["desk", "recycled"],
  },
  {
    handle: "seven-port-usb-c-dock", title: "Seven-Port USB-C Dock", categoryHandles: ["electronics", "workspace"],
    primaryCategoryHandle: "workspace", vendor: "Common Office", price: 119,
    description: "A compact aluminum dock with display, charging, storage, and network ports.", tags: ["usb-c", "productivity"],
  },
  {
    handle: "recycled-fleece-blanket", title: "Recycled Fleece Blanket", categoryHandles: ["outdoors"],
    primaryCategoryHandle: "outdoors", vendor: "Field & Coast", price: 68,
    description: "A warm recycled-fleece blanket that packs neatly for campsites and road trips.", tags: ["outdoors", "recycled"],
  },
  {
    handle: "lightweight-daypack", title: "Lightweight Daypack", categoryHandles: ["outdoors", "accessories", "bags"],
    primaryCategoryHandle: "outdoors", vendor: "Field & Coast", price: 92,
    description: "A streamlined daypack with breathable straps and hydration compatibility.", tags: ["outdoors", "bags"],
  },
  {
    handle: "rechargeable-camp-lantern", title: "Rechargeable Camp Lantern", categoryHandles: ["outdoors", "electronics"],
    primaryCategoryHandle: "outdoors", vendor: "Luma Works", price: 62,
    description: "A weather-resistant lantern with adjustable warm light and USB-C charging.", tags: ["outdoors", "lighting"],
  },
];

const supplementalProductDefinitions = supplementalCollections.flatMap((collection, collectionIndex) =>
  supplementalProductTemplates.map((template, templateIndex) => {
    const sequence = collectionIndex * supplementalProductTemplates.length + templateIndex + 1;
    const sku = `NSD-${String(sequence).padStart(3, "0")}`;
    const price = template.price + collectionIndex * 2;
    const onSale = sequence % 11 === 0;
    const promotionalCategories = [
      ...(sequence % 5 === 0 ? ["new-arrivals"] : []),
      ...(onSale ? ["sale"] : []),
    ];

    return {
      handle: `${collection.handle}-${template.handle}`,
      title: `${collection.name} ${template.title}`,
      hasComponents: sequence <= 50,
      primaryCategoryHandle: template.primaryCategoryHandle,
      categoryHandles: [...new Set([...template.categoryHandles, ...promotionalCategories])],
      vendor: template.vendor,
      description: `${template.description} Part of the ${collection.name} collection.`,
      tags: [...template.tags, collection.handle],
      optionName: template.sized ? "Size" : "Color",
      optionDisplayType: template.sized ? "BUTTONS" : "SWATCH",
      variants: template.sized
        ? sizeVariants(sku, price, ["Small", "Large"], onSale ? price + 20 : null)
        : colorVariants(sku, price, collection.colors, onSale ? price + 20 : null),
    };
  }),
);

export const productDefinitions = [
  ...coreProductDefinitions,
  ...supplementalProductDefinitions,
];

const publishedAt = "2026-03-15T09:00:00.000Z";

export const products = productDefinitions.map((product, productIndex) => {
  const prices = product.variants.map(({ price }) => price);
  const compareAtPrices = product.variants
    .map(({ compareAtPrice }) => compareAtPrice)
    .filter((price) => price !== null);
  const optionHandle = product.optionName.toLowerCase().replaceAll(" ", "-");

  return {
    id: gid("Product", product.handle),
    handle: product.handle,
    title: product.title,
    description: richText(product.description),
    excerpt: richText(product.description),
    seo: {
      title: `${product.title} | Northstar Supply`,
      description: product.description,
      openGraph: {
        title: product.title,
        description: product.description,
        imageId: gid("MediaImage", `product-${product.handle}`),
      },
    },
    vendor: { id: gid("Vendor", product.vendor.toLowerCase().replaceAll(" ", "-")), name: product.vendor },
    tags: product.tags.map((name) => ({
      id: gid("Tag", name),
      handle: name,
      name: name.replaceAll("-", " "),
    })),
    primaryCategoryId: gid(
      "Category",
      product.primaryCategoryHandle ?? product.categoryHandles[product.categoryHandles.length > 1 ? 1 : 0],
    ),
    categoryIds: product.categoryHandles.map((handle) => gid("Category", handle)),
    options: [{
      id: gid("ProductOption", `${product.handle}-${optionHandle}`),
      handle: optionHandle,
      name: product.optionName,
      displayType: product.optionDisplayType,
      position: 0,
      optionValues: product.variants.map((variant, position) => ({
        id: gid("ProductOptionValue", `${product.handle}-${variant.name.toLowerCase().replaceAll(" ", "-")}`),
        handle: variant.name.toLowerCase().replaceAll(" ", "-"),
        name: variant.name,
        position,
        swatch: variant.color
          ? { type: "COLOR", color: variant.color, secondaryColor: null, imageId: null, metadata: null }
          : null,
      })),
    }],
    features: [],
    featureGroups: [],
    mediaIds: [gid("MediaImage", `product-${product.handle}`)],
    featuredMediaId: gid("MediaImage", `product-${product.handle}`),
    variantIds: product.variants.map((_, variantIndex) => gid("ProductVariant", `${product.handle}-${variantIndex + 1}`)),
    priceRange: {
      minVariantPrice: money(Math.min(...prices)),
      maxVariantPrice: money(Math.max(...prices)),
    },
    compareAtPriceRange: compareAtPrices.length
      ? {
          minVariantPrice: money(Math.min(...compareAtPrices)),
          maxVariantPrice: money(Math.max(...compareAtPrices)),
        }
      : null,
    availableForSale: product.variants.some(({ quantity }) => quantity > 0),
    hasComponents: Boolean(product.hasComponents),
    totalInventory: product.variants.reduce((total, { quantity }) => total + quantity, 0),
    publishedAt: new Date(Date.parse(publishedAt) + productIndex * 12 * 3_600_000).toISOString(),
    createdAt: new Date(Date.parse(publishedAt) - 7 * 86_400_000 + productIndex * 12 * 3_600_000).toISOString(),
    updatedAt: FIXTURE_NOW,
  };
});
