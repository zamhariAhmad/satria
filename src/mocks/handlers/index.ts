import { authHandlers } from "./auth";
import { billHandlers } from "./bills";
import { paymentHandlers } from "./payments";
import { studentHandlers } from "./students";
import { dashboardHandlers } from "./dashboard";
import { notificationHandlers } from "./notifications";
import { spiritualHandlers } from "./spiritual";

export const handlers = [
  ...authHandlers,
  ...billHandlers,
  ...paymentHandlers,
  ...studentHandlers,
  ...dashboardHandlers,
  ...notificationHandlers,
  ...spiritualHandlers,
];
