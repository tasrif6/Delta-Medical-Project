import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'blood-bookings.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE_PATH);
  } catch (e) {
    // create file with empty array
    await fs.writeFile(FILE_PATH, JSON.stringify([]), 'utf-8');
  }
}

async function readAll() {
  await ensureDataFile();
  const raw = await fs.readFile(FILE_PATH, 'utf-8');
  return JSON.parse(raw || '[]');
}

async function writeAll(items) {
  await ensureDataFile();
  const tmp = FILE_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf-8');
  await fs.rename(tmp, FILE_PATH);
}

export async function createBooking(booking) {
  const items = await readAll();
  const now = new Date().toISOString();
  const toSave = {
    id: booking.id ?? randomUUID(),
    userId: booking.userId,
    bloodGroup: booking.bloodGroup,
    quantity: booking.quantity,
    priority: booking.priority ?? 'NORMAL',
    status: booking.status ?? 'ACTIVE',
    deductions: booking.deductions ?? [], // [{ bloodBankId, inventoryId, units }]
    createdAt: booking.createdAt ?? now,
    updatedAt: booking.updatedAt ?? now,
  };
  items.push(toSave);
  await writeAll(items);
  return toSave;
}

export async function getBookings() {
  return await readAll();
}

export async function getBookingById(id) {
  const items = await readAll();
  return items.find((b) => b.id === id) || null;
}

export async function updateBookingStatus(id, newStatus) {
  const items = await readAll();
  const idx = items.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  items[idx].status = newStatus;
  items[idx].updatedAt = new Date().toISOString();
  await writeAll(items);
  return items[idx];
}

export async function replaceBooking(id, newBooking) {
  const items = await readAll();
  const idx = items.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...newBooking, updatedAt: new Date().toISOString() };
  await writeAll(items);
  return items[idx];
}

export default { createBooking, getBookings, getBookingById, updateBookingStatus, replaceBooking };
