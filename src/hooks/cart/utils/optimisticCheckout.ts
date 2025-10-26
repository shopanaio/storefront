import type {
  RecordProxy,
  RecordSourceSelectorProxy,
} from "relay-runtime";

let clientLineCounter = 0;

const generateClientLineId = () => {
  clientLineCounter += 1;
  return `client:checkoutLine:${clientLineCounter}`;
};

const generateChildLineId = (parentId: string, index: number) =>
  `${parentId}:child:${index}`;

export const parseAmount = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value == null) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getMoneyRecordAmount = (record: RecordProxy | null | undefined): number =>
  parseAmount(record?.getValue("amount"));

const setMoneyRecordAmount = (
  record: RecordProxy | null | undefined,
  nextAmount: number
) => {
  if (!record) {
    return;
  }
  record.setValue(nextAmount, "amount");
};

export const getCheckoutCurrency = (
  checkoutRecord: RecordProxy
): string | null => {
  const costRecord = checkoutRecord.getLinkedRecord("cost");
  const fallback =
    (costRecord
      ?.getLinkedRecord("totalAmount")
      ?.getValue("currencyCode") as string | null) ?? null;
  return fallback;
};

export const getVariantPricing = (
  variantRecord: RecordProxy | null | undefined
) => {
  const priceRecord = variantRecord?.getLinkedRecord("price");
  const compareAtRecord = variantRecord?.getLinkedRecord("compareAtPrice");

  const priceAmount = parseAmount(priceRecord?.getValue("amount"));
  const compareAtAmount = parseAmount(compareAtRecord?.getValue("amount"));

  const currencyCode =
    (priceRecord?.getValue("currencyCode") as string | null) ??
    (compareAtRecord?.getValue("currencyCode") as string | null) ??
    null;

  return {
    priceAmount,
    compareAtAmount,
    currencyCode,
  };
};

export type LineCostSummary = {
  quantity: number;
  subtotalAmount: number;
  totalAmount: number;
  discountAmount: number;
  unitSubtotal: number;
  unitTotal: number;
  currencyCode: string | null;
};

export const getLineCostSummary = (
  lineRecord: RecordProxy
): LineCostSummary => {
  const quantity = parseAmount(lineRecord.getValue("quantity"));
  const costRecord = lineRecord.getLinkedRecord("cost");
  const subtotalRecord = costRecord?.getLinkedRecord("subtotalAmount");
  const totalRecord = costRecord?.getLinkedRecord("totalAmount");

  const subtotalAmount = getMoneyRecordAmount(subtotalRecord);
  const totalAmount = getMoneyRecordAmount(totalRecord);
  const unitSubtotal = quantity > 0 ? subtotalAmount / quantity : 0;
  const unitTotal = quantity > 0 ? totalAmount / quantity : 0;
  const currencyCode =
    (totalRecord?.getValue("currencyCode") as string | null) ??
    (subtotalRecord?.getValue("currencyCode") as string | null) ??
    null;

  return {
    quantity,
    subtotalAmount,
    totalAmount,
    discountAmount: Math.max(subtotalAmount - totalAmount, 0),
    unitSubtotal,
    unitTotal,
    currencyCode,
  };
};

type CreateCheckoutLineOptions = {
  store: RecordSourceSelectorProxy<unknown>;
  purchasableId: string;
  quantity: number;
  currencyCode: string;
  unitPrice: number;
  compareAtUnitPrice: number;
  subtotalAmount: number;
  totalAmount: number;
  variantRecord?: RecordProxy | null;
  childQuantities?: ReadonlyArray<number>;
};

export type CreatedLinePayload = {
  lineRecord: RecordProxy;
  subtotalAmount: number;
  totalAmount: number;
  discountAmount: number;
  quantity: number;
};

const createMoneyRecord = (
  store: RecordSourceSelectorProxy<unknown>,
  parentKey: string,
  fieldKey: string,
  currencyCode: string,
  amount: number
) => {
  const moneyRecord = store.create(`${parentKey}:${fieldKey}`, "Money");
  moneyRecord.setValue(currencyCode, "currencyCode");
  moneyRecord.setValue(amount, "amount");
  return moneyRecord;
};

export const createCheckoutLineRecord = (
  options: CreateCheckoutLineOptions
): CreatedLinePayload => {
  const {
    store,
    purchasableId,
    quantity,
    currencyCode,
    unitPrice,
    compareAtUnitPrice,
    subtotalAmount,
    totalAmount,
    variantRecord,
    childQuantities,
  } = options;

  const lineId = generateClientLineId();
  const lineRecord = store.create(lineId, "CheckoutLine");

  lineRecord.setValue(lineId, "id");
  lineRecord.setValue(purchasableId, "purchasableId");
  lineRecord.setValue(quantity, "quantity");

  const costRecord = store.create(`${lineId}:cost`, "CheckoutLineCost");
  lineRecord.setLinkedRecord(costRecord, "cost");

  const unitPriceRecord = createMoneyRecord(
    store,
    `${lineId}:cost`,
    "unitPrice",
    currencyCode,
    unitPrice
  );
  costRecord.setLinkedRecord(unitPriceRecord, "unitPrice");

  const compareAtRecord = createMoneyRecord(
    store,
    `${lineId}:cost`,
    "compareAtUnitPrice",
    currencyCode,
    compareAtUnitPrice
  );
  costRecord.setLinkedRecord(compareAtRecord, "compareAtUnitPrice");

  const subtotalRecord = createMoneyRecord(
    store,
    `${lineId}:cost`,
    "subtotalAmount",
    currencyCode,
    subtotalAmount
  );
  costRecord.setLinkedRecord(subtotalRecord, "subtotalAmount");

  const totalRecord = createMoneyRecord(
    store,
    `${lineId}:cost`,
    "totalAmount",
    currencyCode,
    totalAmount
  );
  costRecord.setLinkedRecord(totalRecord, "totalAmount");

  const linkedVariant =
    variantRecord ??
    store.get(purchasableId) ??
    store.create(purchasableId, "ProductVariant");

  lineRecord.setLinkedRecord(linkedVariant, "purchasable");

  const childrenRecords = (childQuantities ?? []).map((childQuantity, idx) => {
    const childId = generateChildLineId(lineId, idx);
    const childRecord =
      store.get(childId) ?? store.create(childId, "CheckoutLine");
    childRecord.setValue(childId, "id");
    childRecord.setValue(childQuantity, "quantity");
    return childRecord;
  });
  lineRecord.setLinkedRecords(childrenRecords, "children");

  return {
    lineRecord,
    subtotalAmount,
    totalAmount,
    discountAmount: Math.max(subtotalAmount - totalAmount, 0),
    quantity,
  };
};

export type LineQuantityUpdateResult = {
  oldQuantity: number;
  newQuantity: number;
  oldSubtotal: number;
  newSubtotal: number;
  oldTotal: number;
  newTotal: number;
};

export const updateLineCostForQuantity = (
  lineRecord: RecordProxy,
  newQuantity: number
): LineQuantityUpdateResult => {
  const costRecord = lineRecord.getLinkedRecord("cost");
  const subtotalRecord = costRecord?.getLinkedRecord("subtotalAmount");
  const totalRecord = costRecord?.getLinkedRecord("totalAmount");
  const unitPriceRecord = costRecord?.getLinkedRecord("unitPrice");

  const oldQuantity = parseAmount(lineRecord.getValue("quantity"));
  const oldSubtotal = getMoneyRecordAmount(subtotalRecord);
  const oldTotal = getMoneyRecordAmount(totalRecord);

  const unitSubtotal =
    oldQuantity > 0
      ? oldSubtotal / oldQuantity
      : getMoneyRecordAmount(unitPriceRecord);
  const unitTotal =
    oldQuantity > 0 ? oldTotal / oldQuantity : getMoneyRecordAmount(totalRecord);

  const nextSubtotal = unitSubtotal * newQuantity;
  const nextTotal = unitTotal * newQuantity;

  lineRecord.setValue(newQuantity, "quantity");
  setMoneyRecordAmount(subtotalRecord, nextSubtotal);
  setMoneyRecordAmount(totalRecord, nextTotal);

  return {
    oldQuantity,
    newQuantity,
    oldSubtotal,
    newSubtotal: nextSubtotal,
    oldTotal,
    newTotal: nextTotal,
  };
};

type AggregateDelta = {
  quantityDelta: number;
  subtotalDelta: number;
  totalDelta: number;
  discountDelta: number;
};

export const applyAggregateDelta = (
  checkoutRecord: RecordProxy,
  delta: AggregateDelta
) => {
  const currentQuantity =
    parseAmount(checkoutRecord.getValue("totalQuantity")) ?? 0;
  checkoutRecord.setValue(
    Math.max(currentQuantity + delta.quantityDelta, 0),
    "totalQuantity"
  );

  const costRecord = checkoutRecord.getLinkedRecord("cost");
  if (!costRecord) {
    return;
  }

  const subtotalRecord = costRecord.getLinkedRecord("subtotalAmount");
  const totalRecord = costRecord.getLinkedRecord("totalAmount");
  const discountRecord = costRecord.getLinkedRecord("totalDiscountAmount");

  const nextSubtotal =
    getMoneyRecordAmount(subtotalRecord) + delta.subtotalDelta;
  const nextTotal = getMoneyRecordAmount(totalRecord) + delta.totalDelta;
  const nextDiscount = Math.max(
    getMoneyRecordAmount(discountRecord) + delta.discountDelta,
    0
  );

  setMoneyRecordAmount(subtotalRecord, nextSubtotal);
  setMoneyRecordAmount(totalRecord, nextTotal);
  setMoneyRecordAmount(discountRecord, nextDiscount);
};
