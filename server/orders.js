/**
 * Lightweight order store (JSON file).
 * Replace with a real DB when you scale.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
}

function readAll() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeAll(orders) {
  ensureStore();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export function createOrder(payload) {
  const orders = readAll();
  const order = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...payload,
  };
  orders.unshift(order);
  writeAll(orders);
  return order;
}

export function updateOrder(id, patch) {
  const orders = readAll();
  const i = orders.findIndex((o) => o.id === id);
  if (i === -1) return null;
  orders[i] = { ...orders[i], ...patch, updatedAt: new Date().toISOString() };
  writeAll(orders);
  return orders[i];
}

export function findByCheckoutId(checkoutRequestId) {
  return readAll().find((o) => o.checkoutRequestId === checkoutRequestId) || null;
}

export function findByMerchantRequestId(merchantRequestId) {
  return readAll().find((o) => o.merchantRequestId === merchantRequestId) || null;
}

export function getOrder(id) {
  return readAll().find((o) => o.id === id) || null;
}
