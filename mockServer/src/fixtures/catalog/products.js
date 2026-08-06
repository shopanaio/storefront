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

const foodVariants = (sku, flavors, packs) =>
  flavors.flatMap((flavor, flavorIndex) =>
    packs.map((pack, packIndex) => ({
      name: `${flavor} / ${pack.name}`,
      optionValues: {
        Flavor: flavor,
        Packaging: pack.name,
      },
      sku: `${sku}-${String(flavorIndex + 1).padStart(2, "0")}-${String(packIndex + 1).padStart(2, "0")}`,
      price: Number((pack.price + flavorIndex * (pack.flavorSurcharge ?? 0)).toFixed(2)),
      compareAtPrice: pack.compareAtPrice ?? null,
      quantity: 8 + ((flavorIndex * 11 + packIndex * 7 + sku.length) % 25),
      weight: { value: pack.weightKg, unit: "kg" },
    })),
  );

const foodProductConfigurations = {
  "salmon-dog-kibble": {
    title: "Royal Canin Medium Adult Dry Dog Food",
    vendor: "Royal Canin",
    description: "Complete Royal Canin dry food for medium adult dogs, offered in several recipes and practical bag sizes.",
    tags: ["royal-canin", "dog-food", "dry-food", "adult-dogs", "bestseller"],
    options: [
      {
        name: "Flavor",
        displayType: "BUTTONS",
        values: ["Salmon & Brown Rice", "Chicken & Oat", "Lamb & Oat"],
      },
      {
        name: "Packaging",
        displayType: "BUTTONS",
        values: ["Trial bag · 1 kg", "Bag · 4 kg", "Large bag · 12 kg"],
      },
    ],
    variants: foodVariants(
      "RC-MEDIUM",
      ["Salmon & Brown Rice", "Chicken & Oat", "Lamb & Oat"],
      [
        { name: "Trial bag · 1 kg", price: 8.49, flavorSurcharge: 0.3, weightKg: 1 },
        { name: "Bag · 4 kg", price: 29.99, flavorSurcharge: 1, weightKg: 4 },
        { name: "Large bag · 12 kg", price: 74.99, flavorSurcharge: 2, compareAtPrice: 82.99, weightKg: 12 },
      ],
    ),
  },
  "chicken-cat-kibble": {
    title: "Royal Canin Adult Cat Wet Food Pouches",
    vendor: "Royal Canin",
    description: "Complete Royal Canin wet cat food in 85 g pouches, available singly or in pantry-friendly multipacks.",
    tags: ["royal-canin", "cat-food", "wet-food", "adult-cats", "bestseller"],
    options: [
      {
        name: "Flavor",
        displayType: "BUTTONS",
        values: ["Chicken in Gravy", "Salmon in Gravy", "Tuna in Gravy", "Variety Pack"],
      },
      {
        name: "Packaging",
        displayType: "BUTTONS",
        values: ["1 pouch · 85 g", "Box · 12 × 85 g", "Case · 24 × 85 g"],
      },
    ],
    variants: foodVariants(
      "RC-CAT-WET",
      ["Chicken in Gravy", "Salmon in Gravy", "Tuna in Gravy", "Variety Pack"],
      [
        { name: "1 pouch · 85 g", price: 1.39, flavorSurcharge: 0.1, weightKg: 0.085 },
        { name: "Box · 12 × 85 g", price: 14.99, flavorSurcharge: 0.5, weightKg: 1.02 },
        { name: "Case · 24 × 85 g", price: 27.49, flavorSurcharge: 1, compareAtPrice: 31.99, weightKg: 2.04 },
      ],
    ),
  },
};

const foodProductDefinition = ({
  handle,
  title,
  categoryHandles,
  vendor,
  description,
  tags,
  sku,
  flavors,
  packs,
}) => ({
  handle,
  title,
  categoryHandles,
  primaryCategoryHandle: categoryHandles.includes("cat-food") ? "cat-food" : "dog-food",
  vendor,
  description,
  tags: [vendor.toLowerCase().replaceAll(" ", "-"), ...tags],
  options: [
    { name: "Flavor", displayType: "BUTTONS", values: flavors },
    { name: "Packaging", displayType: "BUTTONS", values: packs.map(({ name }) => name) },
  ],
  variants: foodVariants(sku, flavors, packs),
});

const dryDogPacks = [
  { name: "Trial bag · 1 kg", price: 10.99, flavorSurcharge: 0.4, weightKg: 1 },
  { name: "Bag · 4 kg", price: 34.99, flavorSurcharge: 1, weightKg: 4 },
  { name: "Large bag · 12 kg", price: 84.99, flavorSurcharge: 2, compareAtPrice: 92.99, weightKg: 12 },
];

const dryCatPacks = [
  { name: "Trial bag · 750 g", price: 8.99, flavorSurcharge: 0.3, weightKg: 0.75 },
  { name: "Bag · 3 kg", price: 27.99, flavorSurcharge: 0.8, weightKg: 3 },
  { name: "Large bag · 7 kg", price: 54.99, flavorSurcharge: 1.5, compareAtPrice: 61.99, weightKg: 7 },
];

const wetCatPacks = [
  { name: "1 pouch · 85 g", price: 1.29, flavorSurcharge: 0.08, weightKg: 0.085 },
  { name: "Box · 12 × 85 g", price: 13.99, flavorSurcharge: 0.4, weightKg: 1.02 },
  { name: "Case · 24 × 85 g", price: 25.99, flavorSurcharge: 0.8, compareAtPrice: 29.99, weightKg: 2.04 },
];

const wetDogPacks = [
  { name: "1 pouch · 100 g", price: 1.39, flavorSurcharge: 0.08, weightKg: 0.1 },
  { name: "Box · 12 × 100 g", price: 14.99, flavorSurcharge: 0.4, weightKg: 1.2 },
  { name: "Case · 24 × 100 g", price: 27.99, flavorSurcharge: 0.8, compareAtPrice: 32.99, weightKg: 2.4 },
];

const brandedFoodDefinitions = [
  foodProductDefinition({
    handle: "sheba-perfect-portions-cat-wet-food",
    title: "Sheba Perfect Portions Adult Cat Wet Food",
    categoryHandles: ["cats", "cat-food", "new-arrivals"],
    vendor: "Sheba",
    description: "Portion-sized wet cat food trays with classic meat and fish recipes.",
    tags: ["cat-food", "wet-food", "trays", "adult-cats"],
    sku: "SHB-PP",
    flavors: ["Chicken Entrée", "Salmon Entrée", "Tuna Entrée", "Variety Pack"],
    packs: [
      { name: "1 twin tray · 75 g", price: 1.49, flavorSurcharge: 0.1, weightKg: 0.075 },
      { name: "Box · 12 × 75 g", price: 15.99, flavorSurcharge: 0.5, weightKg: 0.9 },
      { name: "Case · 24 × 75 g", price: 29.49, flavorSurcharge: 1, compareAtPrice: 33.99, weightKg: 1.8 },
    ],
  }),
  foodProductDefinition({
    handle: "purina-pro-plan-adult-dog-dry-food",
    title: "Purina Pro Plan Adult Dry Dog Food",
    categoryHandles: ["dogs", "dog-food", "new-arrivals"],
    vendor: "Purina Pro Plan",
    description: "High-protein adult dog food recipes with rice or oatmeal.",
    tags: ["dog-food", "dry-food", "adult-dogs"],
    sku: "PPP-DOG",
    flavors: ["Chicken & Rice", "Salmon & Rice", "Lamb & Oatmeal"],
    packs: dryDogPacks,
  }),
  foodProductDefinition({
    handle: "purina-one-adult-cat-dry-food",
    title: "Purina ONE Adult Dry Cat Food",
    categoryHandles: ["cats", "cat-food"],
    vendor: "Purina ONE",
    description: "Complete dry nutrition for adult cats in everyday and bulk bag sizes.",
    tags: ["cat-food", "dry-food", "adult-cats"],
    sku: "PON-CAT",
    flavors: ["Chicken & Rice", "Salmon & Rice", "Turkey"],
    packs: dryCatPacks,
  }),
  foodProductDefinition({
    handle: "hills-science-plan-adult-dog-dry-food",
    title: "Hill's Science Plan Adult Dry Dog Food",
    categoryHandles: ["dogs", "dog-food"],
    vendor: "Hill's Science Plan",
    description: "Balanced adult dog food offered in several protein recipes and bag sizes.",
    tags: ["dog-food", "dry-food", "adult-dogs"],
    sku: "HSP-DOG",
    flavors: ["Chicken & Barley", "Lamb & Brown Rice", "Salmon & Brown Rice"],
    packs: dryDogPacks,
  }),
  foodProductDefinition({
    handle: "whiskas-adult-cat-pouches",
    title: "Whiskas Adult Cat Food Pouches",
    categoryHandles: ["cats", "cat-food"],
    vendor: "Whiskas",
    description: "Adult wet cat food in gravy, sold as a single pouch or multipack.",
    tags: ["cat-food", "wet-food", "pouches", "adult-cats"],
    sku: "WHK-WET",
    flavors: ["Chicken in Gravy", "Beef in Gravy", "Salmon in Gravy", "Variety Pack"],
    packs: wetCatPacks,
  }),
  foodProductDefinition({
    handle: "brit-care-cat-pouches",
    title: "Brit Care Adult Cat Food Pouches",
    categoryHandles: ["cats", "cat-food", "new-arrivals"],
    vendor: "Brit Care",
    description: "Complete wet food pouches with meat, fish, and vegetable recipe combinations.",
    tags: ["cat-food", "wet-food", "pouches", "grain-free"],
    sku: "BRC-CAT",
    flavors: ["Chicken & Cheese", "Turkey & Salmon", "Duck & Carrot", "Variety Pack"],
    packs: wetCatPacks,
  }),
  foodProductDefinition({
    handle: "club-4-paws-adult-dog-pouches",
    title: "Club 4 Paws Adult Dog Food Pouches",
    categoryHandles: ["dogs", "dog-food"],
    vendor: "Club 4 Paws",
    description: "Portioned wet dog food in gravy for everyday adult feeding.",
    tags: ["dog-food", "wet-food", "pouches", "adult-dogs"],
    sku: "C4P-DOG",
    flavors: ["Chicken in Gravy", "Turkey in Gravy", "Beef in Gravy", "Variety Pack"],
    packs: wetDogPacks,
  }),
  foodProductDefinition({
    handle: "acana-adult-dog-dry-food",
    title: "Acana Adult Dry Dog Food",
    categoryHandles: ["dogs", "dog-food"],
    vendor: "Acana",
    description: "Protein-rich adult dog kibble in poultry, meat, and fish recipes.",
    tags: ["dog-food", "dry-food", "high-protein"],
    sku: "ACN-DOG",
    flavors: ["Free-Run Poultry", "Red Meat", "Wild Fish"],
    packs: dryDogPacks,
  }),
  foodProductDefinition({
    handle: "josera-adult-cat-dry-food",
    title: "Josera Adult Dry Cat Food",
    categoryHandles: ["cats", "cat-food"],
    vendor: "Josera",
    description: "Complete adult cat kibble in poultry and fish recipes.",
    tags: ["cat-food", "dry-food", "adult-cats"],
    sku: "JSR-CAT",
    flavors: ["Chicken", "Salmon", "Duck"],
    packs: dryCatPacks,
  }),
  foodProductDefinition({
    handle: "royal-canin-mini-adult-dry-dog-food",
    title: "Royal Canin Mini Adult Dry Dog Food",
    categoryHandles: ["dogs", "dog-food"],
    vendor: "Royal Canin",
    description: "Complete dry food for small adult dogs in practical bag sizes.",
    tags: ["dog-food", "dry-food", "small-breed", "adult-dogs"],
    sku: "RC-MINI",
    flavors: ["Chicken", "Lamb & Rice", "Salmon"],
    packs: dryDogPacks,
  }),
];

const coreProductSeeds = [
  {
    handle: "essential-cotton-tee",
    title: "Essential Cotton Tee",
    categoryHandles: ["women", "women-clothing", "new-arrivals"],
    vendor: "Paw & Whisker",
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
    vendor: "Paw & Whisker",
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
    vendor: "Paw & Whisker",
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
    vendor: "Paw & Whisker",
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

const petCoreCatalog = [
  ["salmon-dog-kibble", "Wild Salmon Dog Kibble", ["dogs", "dog-food", "new-arrivals"], "Good Hound Kitchen", "Protein-rich salmon recipe with brown rice and prebiotics for adult dogs.", ["dog-food", "salmon", "bestseller"], "Bag size", "BUTTONS", "GHK-SAL", ["2 lb", "12 lb", "24 lb"]],
  ["chicken-cat-kibble", "Indoor Chicken Cat Kibble", ["cats", "cat-food", "new-arrivals"], "Whisker Pantry", "Balanced chicken recipe with fiber support for healthy indoor cats.", ["cat-food", "chicken", "indoor-cats"], "Bag size", "BUTTONS", "WHP-CHK", ["3 lb", "7 lb", "14 lb", "20 lb"]],
  ["calming-dog-bed", "Cloud Calming Dog Bed", ["dogs", "beds-comfort"], "Nuzzle & Nap", "A plush donut bed with supportive filling for dogs who love to curl up.", ["dog-bed", "calming", "washable"], "Size", "BUTTONS", "NNP-CLD", ["Small", "Medium", "Large", "XL"]],
  ["cat-window-perch", "Sunny Window Cat Perch", ["cats", "beds-comfort"], "Nuzzle & Nap", "A sturdy cushioned perch that gives cats a comfortable front-row window seat.", ["cat-bed", "window-perch", "bestseller"], "Width", "DROPDOWN", "NNP-WIN", ["18 in", "22 in", "26 in", "30 in", "34 in"]],
  ["dental-dog-chews", "Daily Dental Dog Chews", ["dogs", "dog-food", "new-arrivals"], "Good Hound Kitchen", "Ridged daily chews that help freshen breath and reduce plaque buildup.", ["dog-treats", "dental-care", "grain-free"], "Dog size", "BUTTONS", "GHK-DEN", ["Small", "Medium", "Large", "XL"]],
  ["freeze-dried-cat-treats", "Freeze-Dried Chicken Cat Treats", ["cats", "cat-food"], "Whisker Pantry", "Single-ingredient chicken bites with a light crunch cats love.", ["cat-treats", "freeze-dried", "single-ingredient"], "Pack", "BUTTONS", "WHP-FDC", ["1.5 oz", "3 oz", "6 oz"]],
  ["dog-raincoat", "Trailproof Dog Raincoat", ["dogs", "travel"], "Roam Pet Gear", "A lightweight waterproof dog coat with reflective trim and an adjustable fit.", ["dog-apparel", "waterproof", "reflective"], "Size", "BUTTONS", "RPG-RAN", ["Small", "Medium", "Large", "XL"]],
  ["orthopedic-dog-bed", "Orthopedic Memory Foam Dog Bed", ["dogs", "beds-comfort", "travel", "sale"], "Nuzzle & Nap", "A supportive memory-foam bed with a washable cover and low step-in edge.", ["dog-bed", "orthopedic", "senior-dogs"], "Size", "BUTTONS", "NNP-ORT", ["Small", "Medium", "Large", "XL"]],
  ["leather-dog-collar", "Soft Leather Dog Collar", ["walking", "collars-leashes", "new-arrivals"], "Roam Pet Gear", "A supple vegetable-tanned leather collar with solid brass hardware.", ["dog-collar", "leather", "handmade"], "Color", "SWATCH", "RPG-LTH", ["Cognac", "Black"]],
  ["waste-bag-dispenser", "Recycled Waste Bag Dispenser", ["walking", "collars-leashes"], "Paw & Whisker", "A compact recycled-canvas dispenser that clips securely to any leash.", ["dog-walking", "recycled", "everyday"], "Color", "SWATCH", "PAW-WBD", ["Natural", "Olive"]],
  ["pet-travel-carrier", "Airflow Pet Travel Carrier", ["travel", "walking", "new-arrivals"], "Roam Pet Gear", "A structured airline-friendly carrier with mesh panels and a washable base.", ["pet-carrier", "travel", "airline-friendly"], "Color", "SWATCH", "RPG-CAR", ["Graphite", "Forest"]],
  ["retractable-dog-leash", "Comfort Grip Retractable Leash", ["walking", "collars-leashes"], "Roam Pet Gear", "A smooth five-meter retractable lead with a reliable one-touch brake.", ["dog-leash", "walking", "reflective"], "Tape", "DROPDOWN", "RPG-RET", ["Tan", "Black"]],
  ["engraved-pet-id-tag", "Engraved Pet ID Tag", ["walking", "identification"], "Homeward Tags", "A lightweight stainless-steel tag personalized with your pet’s details.", ["pet-id", "personalized", "durable"], "Size", "BUTTONS", "HWT-IDT", ["Small", "Medium"]],
  ["cat-breakaway-collar", "Reflective Breakaway Cat Collar", ["cats", "walking", "identification", "new-arrivals"], "Homeward Tags", "A soft reflective cat collar with a safety-release buckle and quiet bell.", ["cat-collar", "breakaway", "reflective"], "Color", "SWATCH", "HWT-CAT", ["Tortoise", "Black", "Moss"]],
  ["ceramic-pet-bowl-set", "Ceramic Pet Bowl Set", ["feeding", "bowls-feeders"], "Kindred Bowl Co.", "Two weighty hand-glazed bowls for food and water with non-slip bases.", ["pet-bowls", "ceramic", "dishwasher-safe"], "Glaze", "SWATCH", "KBC-SET", ["Oat", "Slate"]],
  ["slow-feeder-bowl", "Acacia Slow Feeder Bowl", ["feeding", "bowls-feeders"], "Kindred Bowl Co.", "A naturally finished feeder with raised channels that encourage slower eating.", ["slow-feeder", "wood", "dog-bowl"], "Size", "BUTTONS", "KBC-SLO", ["Medium", "Large"]],
  ["portable-pet-water-bottle", "Portable Pet Water Bottle", ["feeding", "bowls-feeders", "travel"], "Roam Pet Gear", "A leakproof bottle with an integrated drinking trough for walks and trips.", ["hydration", "travel", "reusable"], "Color", "SWATCH", "RPG-WTR", ["Sea", "Sand", "Ink"]],
  ["washable-pet-blanket", "Washable Pet Blanket", ["feeding", "beds-comfort", "sale"], "Nuzzle & Nap", "A soft double-sided blanket that protects furniture and washes easily.", ["pet-blanket", "washable", "cozy"], "Color", "SWATCH", "NNP-BLK", ["Flax", "Rust"]],
  ["smart-pet-feeder", "Smart Portion Pet Feeder", ["feeding", "bowls-feeders", "smart-pet", "automatic-care"], "Petlink Labs", "A Wi-Fi feeder with scheduled portions, backup power, and app alerts.", ["smart-feeder", "automatic", "bestseller"], "Color", "SWATCH", "PLL-FDR", ["Chalk", "Ochre", "Charcoal"]],
  ["odor-neutralizing-candle", "Pet-Safe Odor Neutralizing Candle", ["feeding", "beds-comfort"], "Fresh Den", "A pet-safe soy candle formulated to neutralize odors with a soft cedar scent.", ["pet-safe", "odor-control", "soy-wax"], "Size", "BUTTONS", "FRD-CND", ["8 oz", "12 oz"]],
  ["gps-pet-tracker", "GPS Pet Tracker", ["smart-pet", "trackers-cameras", "new-arrivals"], "Petlink Labs", "A waterproof real-time tracker with safe-zone alerts and activity insights.", ["gps", "pet-safety", "waterproof"], "Color", "SWATCH", "PLL-GPS", ["Midnight", "Stone"]],
  ["interactive-treat-camera", "Interactive Pet Treat Camera", ["smart-pet", "trackers-cameras"], "Petlink Labs", "A wide-angle pet camera with two-way audio and remote treat tossing.", ["pet-camera", "treat-tossing", "wifi"], "Color", "SWATCH", "PLL-CAM", ["Cobalt", "Coral", "Black"]],
  ["self-cleaning-litter-box", "Self-Cleaning Litter Box", ["cats", "smart-pet", "automatic-care"], "Clean Paws Tech", "A quiet automatic litter box with odor control and safety sensors.", ["cat-litter", "automatic", "odor-control"], "Model", "BUTTONS", "CPT-LIT", ["Standard", "Connect"]],
  ["automatic-water-fountain", "Automatic Pet Water Fountain", ["feeding", "bowls-feeders", "smart-pet", "automatic-care"], "Clean Paws Tech", "A quiet filtered fountain that keeps water fresh and easy to access.", ["pet-fountain", "filtered", "quiet"], "Color", "SWATCH", "CPT-FNT", ["Black", "White"]],
  ["silicone-lick-mat", "Silicone Enrichment Lick Mat", ["dogs", "cats", "feeding", "new-arrivals"], "Bright Tail Play", "A textured food-grade silicone mat for treats, calming, and slow feeding.", ["enrichment", "slow-feeding", "dishwasher-safe"], "Color", "SWATCH", "BTP-LCK", ["Juniper", "Terracotta"]],
  ["waterproof-car-seat-cover", "Waterproof Pet Car Seat Cover", ["travel", "sale"], "Roam Pet Gear", "A quilted non-slip back-seat protector with seat-belt openings and side flaps.", ["car-travel", "waterproof", "washable"], "Color", "SWATCH", "RPG-CVR", ["Meadow", "Sunset"]],
];

const coreProductDefinitions = coreProductSeeds.map((seed, index) => {
  const [handle, title, categoryHandles, vendor, description, tags, optionName, optionDisplayType, sku, variantNames] = petCoreCatalog[index];
  const foodConfiguration = foodProductConfigurations[handle];

  return {
    ...seed,
    handle,
    title,
    categoryHandles,
    primaryCategoryHandle: categoryHandles[categoryHandles.length > 1 ? 1 : 0],
    vendor,
    description,
    tags,
    optionName,
    optionDisplayType,
    ...(foodConfiguration ?? {}),
    variants: foodConfiguration?.variants ?? seed.variants.map((variant, variantIndex) => ({
      ...variant,
      name: variantNames[variantIndex],
      sku: `${sku}-${String(variantIndex + 1).padStart(2, "0")}`,
    })),
  };
});

const supplementalCollections = [
  { handle: "puppy", name: "Puppy", colors: [["Sky", "#DDE7E7"], ["Pine", "#39564A"]] },
  { handle: "kitten", name: "Kitten", colors: [["Mint", "#91B8AF"], ["Navy", "#26364A"]] },
  { handle: "active", name: "Active Pet", colors: [["Sand", "#CDBA9C"], ["Coral", "#B7644D"]] },
  { handle: "senior", name: "Senior Pet", colors: [["Moss", "#69745B"], ["Bark", "#684D3C"]] },
  { handle: "indoor", name: "Indoor Pet", colors: [["Fog", "#BCC2BE"], ["Ink", "#252D35"]] },
  { handle: "adventure", name: "Adventure Pet", colors: [["Sage", "#82967C"], ["Poppy", "#C85E4B"]] },
  { handle: "minimal", name: "Modern Pet", colors: [["Chalk", "#E6E1D7"], ["Graphite", "#42474A"]] },
  { handle: "natural", name: "Natural Pet", colors: [["Stone", "#918B80"], ["Ember", "#A9533E"]] },
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
    primaryCategoryHandle: "women-clothing", vendor: "Paw & Whisker", price: 34, sized: true,
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
    primaryCategoryHandle: "men-clothing", vendor: "Paw & Whisker", price: 98, sized: true,
    description: "A fine-gauge merino sweater that regulates temperature across seasons.", tags: ["men", "merino"],
  },
  {
    handle: "tapered-chino", title: "Tapered Chino", categoryHandles: ["men", "men-clothing"],
    primaryCategoryHandle: "men-clothing", vendor: "Paw & Whisker", price: 82, sized: true,
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

const petSupplementalCatalog = [
  ["lamb-dog-kibble", "Lamb & Oat Dog Kibble", ["dogs", "dog-food"], "dog-food", "Good Hound Kitchen", "A gentle lamb recipe with whole oats for everyday canine nutrition.", ["dog-food", "lamb"]],
  ["turkey-dog-stew", "Turkey & Pumpkin Dog Stew", ["dogs", "dog-food"], "dog-food", "Good Hound Kitchen", "A hearty wet-food recipe with turkey, pumpkin, and garden vegetables.", ["dog-food", "wet-food"]],
  ["peanut-butter-training-treats", "Peanut Butter Training Treats", ["dogs", "dog-food"], "dog-food", "Good Hound Kitchen", "Small soft-baked rewards sized for positive training sessions.", ["dog-treats", "training"]],
  ["beef-bully-sticks", "Natural Beef Bully Sticks", ["dogs", "dog-food"], "dog-food", "Good Hound Kitchen", "Single-ingredient long-lasting chews for supervised enjoyment.", ["dog-chews", "natural"]],
  ["salmon-cat-pate", "Salmon Cat Pâté", ["cats", "cat-food"], "cat-food", "Whisker Pantry", "Smooth salmon pâté with added taurine and plenty of moisture.", ["cat-food", "wet-food"]],
  ["tuna-cat-broth", "Tuna Hydration Broth", ["cats", "cat-food"], "cat-food", "Whisker Pantry", "A savory broth topper that adds flavor and moisture to meals.", ["cat-food", "hydration"]],
  ["chicken-cat-bites", "Chicken Cat Treat Bites", ["cats", "cat-food"], "cat-food", "Whisker Pantry", "Tender bite-size chicken treats for play, bonding, and rewards.", ["cat-treats", "chicken"]],
  ["hairball-support-chews", "Hairball Support Chews", ["cats", "cat-food"], "cat-food", "Whisker Pantry", "Soft daily chews with fiber to support healthy digestion.", ["cat-care", "digestive-support"]],
  ["padded-dog-harness", "Padded Everyday Dog Harness", ["walking", "collars-leashes", "travel"], "collars-leashes", "Roam Pet Gear", "An adjustable no-chafe harness with front and back lead attachments.", ["dog-harness", "walking"]],
  ["rope-dog-leash", "Soft Rope Dog Leash", ["walking", "collars-leashes"], "collars-leashes", "Roam Pet Gear", "A comfortable climbing-rope lead with a locking carabiner.", ["dog-leash", "durable"]],
  ["hands-free-dog-leash", "Hands-Free Dog Leash", ["walking", "collars-leashes"], "collars-leashes", "Roam Pet Gear", "An adjustable waist leash with a shock-absorbing section for active walks.", ["dog-leash", "running"]],
  ["round-pet-id-tag", "Round Pet ID Tag", ["walking", "identification"], "identification", "Homeward Tags", "A classic engraved tag with room for a name and two phone numbers.", ["pet-id", "personalized"]],
  ["qr-pet-id-tag", "QR Smart Pet ID Tag", ["walking", "identification"], "identification", "Homeward Tags", "A scannable tag linked to an updateable pet profile and emergency contacts.", ["pet-id", "smart-tag"]],
  ["silicone-tag-silencer", "Silicone Tag Silencer", ["walking", "identification"], "identification", "Homeward Tags", "A flexible tag frame that reduces jingling and protects engraving.", ["pet-id", "quiet"]],
  ["stainless-pet-bowl-set", "Stainless Pet Bowl Set", ["feeding", "bowls-feeders"], "bowls-feeders", "Kindred Bowl Co.", "Two durable stainless bowls with removable non-slip silicone bases.", ["pet-bowls", "stainless-steel"]],
  ["elevated-pet-feeder", "Elevated Pet Feeder", ["feeding", "bowls-feeders"], "bowls-feeders", "Kindred Bowl Co.", "A stable raised stand with two dishwasher-safe bowls.", ["pet-feeder", "elevated"]],
  ["puzzle-slow-feeder", "Puzzle Slow Feeder", ["feeding", "bowls-feeders"], "bowls-feeders", "Bright Tail Play", "A maze-style bowl that adds enrichment and encourages slower meals.", ["slow-feeder", "enrichment"]],
  ["travel-food-container", "Travel Food Container", ["feeding", "bowls-feeders", "travel"], "bowls-feeders", "Roam Pet Gear", "A sealed food container with a built-in measuring cup for trips.", ["pet-travel", "food-storage"]],
  ["bolster-pet-bed", "Washable Bolster Pet Bed", ["feeding", "beds-comfort"], "beds-comfort", "Nuzzle & Nap", "A supportive bolster bed with a removable machine-washable cover.", ["pet-bed", "washable"]],
  ["cave-cat-bed", "Cozy Cave Cat Bed", ["cats", "beds-comfort"], "beds-comfort", "Nuzzle & Nap", "A soft felted hideaway for cats who prefer warm enclosed naps.", ["cat-bed", "cozy"]],
  ["smart-collar-tracker", "Smart Collar Activity Tracker", ["smart-pet", "trackers-cameras"], "trackers-cameras", "Petlink Labs", "A lightweight tracker for daily activity, rest, and location history.", ["pet-tracker", "activity"]],
  ["wifi-pet-camera", "Wi-Fi Pet Camera", ["smart-pet", "trackers-cameras"], "trackers-cameras", "Petlink Labs", "A compact camera with night vision, motion alerts, and two-way audio.", ["pet-camera", "wifi"]],
  ["microchip-pet-feeder", "Microchip Pet Feeder", ["feeding", "smart-pet", "automatic-care"], "automatic-care", "Clean Paws Tech", "A selective feeder that opens only for the assigned microchipped pet.", ["smart-feeder", "multi-pet"]],
  ["automatic-treat-dispenser", "Automatic Treat Dispenser", ["smart-pet", "automatic-care"], "automatic-care", "Petlink Labs", "A scheduled treat dispenser with portion controls and app notifications.", ["treat-dispenser", "automatic"]],
  ["litter-odor-monitor", "Smart Litter Odor Monitor", ["cats", "smart-pet", "automatic-care"], "automatic-care", "Clean Paws Tech", "A compact monitor that tracks litter-box conditions and sends care reminders.", ["cat-care", "smart-home"]],
  ["folding-pet-crate", "Folding Pet Travel Crate", ["travel"], "travel", "Roam Pet Gear", "A sturdy collapsible crate with ventilation panels and a washable mat.", ["pet-crate", "travel"]],
  ["airline-pet-carrier", "Airline Pet Carrier", ["travel", "walking", "collars-leashes"], "travel", "Roam Pet Gear", "A lightweight under-seat carrier with generous ventilation and secure openings.", ["pet-carrier", "airline-friendly"]],
  ["portable-dog-ramp", "Portable Dog Ramp", ["travel", "dogs"], "travel", "Roam Pet Gear", "A grippy folding ramp that helps pets enter cars with less joint strain.", ["dog-ramp", "senior-dogs"]],
];

const petSupplementalProductTemplates = supplementalProductTemplates.map((seed, index) => {
  const [handle, title, categoryHandles, primaryCategoryHandle, vendor, description, tags] = petSupplementalCatalog[index];
  return { ...seed, handle, title, categoryHandles, primaryCategoryHandle, vendor, description, tags };
});

const supplementalProductDefinitions = supplementalCollections.flatMap((collection, collectionIndex) =>
  petSupplementalProductTemplates.map((template, templateIndex) => {
    const sequence = collectionIndex * petSupplementalProductTemplates.length + templateIndex + 1;
    const sku = `PAW-${String(sequence).padStart(3, "0")}`;
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
  ...brandedFoodDefinitions,
  ...supplementalProductDefinitions,
];

const publishedAt = "2026-03-15T09:00:00.000Z";

const optionValueHandle = (value) => value
  .toLowerCase()
  .replaceAll("&", "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const productOptions = (product) => product.options ?? [{
  name: product.optionName,
  displayType: product.optionDisplayType,
  values: product.variants.map(({ name, color }) => ({ name, color })),
}];

export const products = productDefinitions.map((product, productIndex) => {
  const prices = product.variants.map(({ price }) => price);
  const compareAtPrices = product.variants
    .map(({ compareAtPrice }) => compareAtPrice)
    .filter((price) => price !== null);

  return {
    id: gid("Product", product.handle),
    handle: product.handle,
    title: product.title,
    description: richText(product.description),
    excerpt: richText(product.description),
    seo: {
      title: `${product.title} | Paw & Whisker`,
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
    options: productOptions(product).map((option, optionPosition) => {
      const optionHandle = optionValueHandle(option.name);
      const values = option.values.map((value) => typeof value === "string" ? { name: value } : value);

      return {
        id: gid("ProductOption", `${product.handle}-${optionHandle}`),
        handle: optionHandle,
        name: option.name,
        displayType: option.displayType,
        position: optionPosition,
        optionValues: values.map((value, position) => {
          const valueHandle = optionValueHandle(value.name);
          const valueId = product.options
            ? `${product.handle}-${optionHandle}-${valueHandle}`
            : `${product.handle}-${valueHandle}`;

          return {
            id: gid("ProductOptionValue", valueId),
            handle: valueHandle,
            name: value.name,
            position,
            swatch: value.color
              ? { type: "COLOR", color: value.color, secondaryColor: null, imageId: null, metadata: null }
              : null,
          };
        }),
      };
    }),
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
