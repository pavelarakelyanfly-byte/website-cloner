import checkout from "../../../content/checkout.json";
﻿/** Temporary checkout data until an order repository is connected. Prices are kopecks. */
export const demoOrder = checkout.order;

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 2 }).format(amount / 100);
}
