import { orders } from "./orders.js";
import { gid } from "../shared.js";

const orderByNumber = (number) => orders.find((order) => order.number === number);

const completedOrder = orderByNumber("1005");
const requestedOrder = orderByNumber("1007");

export const orderReturnRequests = [
  {
    id: gid("OrderReturnRequest", "1005"),
    orderId: completedOrder.id,
    status: "COMPLETED",
    revision: 4,
    lines: [{
      orderLineId: completedOrder.lines[1].id,
      quantity: 1,
      reason: "NOT_AS_DESCRIBED",
      note: "The camera’s treat compartment is smaller than expected.",
    }],
    customerNote: "Please refund to the original payment method.",
    canCancel: false,
    requestedAt: "2026-05-27T10:15:00.000Z",
    resolvedAt: "2026-06-02T10:00:00.000Z",
    createdAt: "2026-05-27T10:15:00.000Z",
    updatedAt: "2026-06-02T10:00:00.000Z",
  },
  {
    id: gid("OrderReturnRequest", "1007"),
    orderId: requestedOrder.id,
    status: "REQUESTED",
    revision: 1,
    lines: [{
      orderLineId: requestedOrder.lines[0].id,
      quantity: 1,
      reason: "SIZE_OR_FIT",
      note: "My cat prefers a smaller kibble size.",
    }],
    customerNote: null,
    canCancel: true,
    requestedAt: "2026-08-02T14:30:00.000Z",
    resolvedAt: null,
    createdAt: "2026-08-02T14:30:00.000Z",
    updatedAt: "2026-08-02T14:30:00.000Z",
  },
];
