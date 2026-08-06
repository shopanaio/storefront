export const gid = (type, value) => `gid://shopana/${type}/${value}`;

export const money = (amount, currencyCode = "USD") => ({
  amount: Number(amount).toFixed(2),
  currencyCode,
});

export const richText = (text) => ({
  text,
  html: `<p>${text}</p>`,
  json: {
    type: "root",
    children: [{ type: "paragraph", children: [{ type: "text", value: text }] }],
  },
});

export const emptyViewerState = {
  viewerEngagement: { vote: null, hasReported: false },
  viewerCapabilities: { canUpdate: false, canDelete: false, editableUntil: null },
};

export const contentMetrics = (overrides = {}) => ({
  likeCount: 0,
  dislikeCount: 0,
  mediaCount: 0,
  childCount: 0,
  officialChildCount: 0,
  acceptedChildCount: 0,
  lastChildAt: null,
  updatedAt: null,
  ...overrides,
});

export const postalAddress = ({
  id,
  firstName,
  lastName,
  company = null,
  address1,
  address2 = null,
  city,
  province,
  provinceCode,
  country,
  countryCode,
  zip,
  phone,
}) => ({
  id,
  firstName,
  lastName,
  name: `${firstName} ${lastName}`,
  company,
  address1,
  address2,
  city,
  province,
  provinceCode,
  country,
  countryCode,
  zip,
  phone,
  formatted: [
    `${firstName} ${lastName}`,
    [address1, address2].filter(Boolean).join(", "),
    `${city}, ${provinceCode} ${zip}`,
    country,
  ],
  formattedArea: `${city}, ${provinceCode}, ${country}`,
});
