"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "./onboarding";
import { createBooking, getBookings, getBookingById, updateBookingStatus } from "@/lib/bloodBookings";
import { randomUUID } from "crypto";

const CENTRAL_BANK_NAME = "Central Blood Bank";

async function findOrCreateCentralBank(tx, user) {
  let central = await tx.bloodBank.findFirst({ where: { name: CENTRAL_BANK_NAME } });
  if (!central) {
    // Create a minimal central bank record using the admin as creator
    central = await tx.bloodBank.create({
      data: {
        name: CENTRAL_BANK_NAME,
        address: "",
        city: "",
        createdById: user.id,
      },
    });
  }
  return central;
}

/* ---------------------------------------
   ADMIN: Add blood stock (maps to central bank inventory)
--------------------------------------- */
export async function addBloodStock({ bloodGroup, quantity }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  return await db.$transaction(async (tx) => {
    const central = await findOrCreateCentralBank(tx, user);

    // Upsert inventory record for the central bank
    const inv = await tx.bloodInventory.upsert({
      where: { bloodBankId_bloodGroup: { bloodBankId: central.id, bloodGroup } },
      update: { units: { increment: quantity } },
      create: { bloodBankId: central.id, bloodGroup, units: quantity },
    });

    return inv;
  });
}

/* ---------------------------------------
   ADMIN: Remove blood stock (from central bank only)
--------------------------------------- */
export async function removeBloodStock({ bloodGroup, quantity }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return await db.$transaction(async (tx) => {
    const central = await findOrCreateCentralBank(tx, user);
    const inv = await tx.bloodInventory.findUnique({ where: { bloodBankId_bloodGroup: { bloodBankId: central.id, bloodGroup } } });

    if (!inv || inv.units < quantity) {
      throw new Error("Insufficient stock");
    }

    return await tx.bloodInventory.update({ where: { id: inv.id }, data: { units: { decrement: quantity } } });
  });
}

/* ---------------------------------------
   DOCTOR & PATIENT: Book blood
   Behavior: deplete central bank first (if present), then deplete other bank inventories.
   Bookings are persisted to a local JSON file at /data/blood-bookings.json
--------------------------------------- */
export async function bookBlood({
  bloodGroup,
  quantity,
  emergency = false,
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  // We'll perform inventory updates in a DB transaction, then persist booking to a JSON file.
  // If persisting fails, we attempt a compensating transaction to restore inventories.
  const txResult = await db.$transaction(async (tx) => {
    let remaining = quantity;
    const deductions = []; // { bloodBankId, inventoryId, units }

    // Try central bank first
    const central = await tx.bloodBank.findFirst({ where: { name: CENTRAL_BANK_NAME } });
    if (central) {
      const ci = await tx.bloodInventory.findUnique({ where: { bloodBankId_bloodGroup: { bloodBankId: central.id, bloodGroup } } });
      if (ci && ci.units > 0) {
        const take = Math.min(ci.units, remaining);
        await tx.bloodInventory.update({ where: { id: ci.id }, data: { units: { decrement: take } } });
        deductions.push({ bloodBankId: central.id, inventoryId: ci.id, units: take });
        remaining -= take;
      }
    }

    // Deplete other inventories if needed
    if (remaining > 0) {
      const agg = await tx.bloodInventory.aggregate({ where: { bloodGroup }, _sum: { units: true } });
      const totalAvailable = agg._sum?.units || 0;
      if (totalAvailable < remaining) {
        throw new Error("Not enough blood available");
      }

      const inventories = await tx.bloodInventory.findMany({ where: { bloodGroup, units: { gt: 0 } }, orderBy: { units: "desc" } });
      let toDeduct = remaining;
      for (const inv of inventories) {
        if (toDeduct <= 0) break;
        const take = Math.min(inv.units, toDeduct);
        await tx.bloodInventory.update({ where: { id: inv.id }, data: { units: { decrement: take } } });
        deductions.push({ bloodBankId: inv.bloodBankId, inventoryId: inv.id, units: take });
        toDeduct -= take;
      }

      remaining = toDeduct;
    }

    if (remaining > 0) {
      throw new Error("Not enough blood available");
    }

    return { deductions };
  });

  // Try to persist booking to file. On failure, compensate by returning stock.
  try {
    const booking = await createBooking({
      id: randomUUID(),
      userId: user.id,
      bloodGroup,
      quantity,
      priority: emergency ? "EMERGENCY" : "NORMAL",
      status: "ACTIVE",
      deductions: txResult.deductions,
    });

    return booking;
  } catch (e) {
    // Persisting booking failed; attempt to restore deducted units
    try {
      await db.$transaction(async (tx) => {
        for (const d of txResult.deductions) {
          await tx.bloodInventory.update({ where: { id: d.inventoryId }, data: { units: { increment: d.units } } });
        }
      });
    } catch (restoreErr) {
      console.error("Failed to persist booking and failed to restore inventory:", restoreErr);
    }

    throw new Error("Failed to persist booking; inventory restored when possible.");
  }
}

// Read helper: Get current blood stock (any authenticated user can read)
export async function getBloodStock() {
  // Aggregate per-bank inventory
  const inventoryAgg = await db.bloodInventory.groupBy({ by: ["bloodGroup"], _sum: { units: true } });

  const totals = {};
  inventoryAgg.forEach((row) => {
    totals[row.bloodGroup] = (row._sum?.units || 0) + (totals[row.bloodGroup] || 0);
  });

  // Convert to array
  const result = Object.keys(totals).map((bg) => ({ bloodGroup: bg, quantity: totals[bg] }));

  // Ensure all blood groups are included (even zero)
  const allGroups = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"];
  allGroups.forEach((g) => {
    if (!result.find((r) => r.bloodGroup === g)) {
      result.push({ bloodGroup: g, quantity: 0 });
    }
  });

  // Sort by bloodGroup name
  result.sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));

  return result;
}

// Read helper: Get all bookings (admins can see all; others see their own)
export async function getBloodBookings({ user } = {}) {
  try {
    const all = await getBookings();
    if (user?.role === "ADMIN") {
      return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (!user) return [];

    return all.filter((b) => b.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    console.warn("getBloodBookings: bookings file not available yet.", e);
    return [];
  }
}

/* ---------------------------------------
   CANCEL BLOOD BOOKING
--------------------------------------- */
export async function cancelBloodBooking(bookingId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const booking = await getBookingById(bookingId);
  if (!booking || booking.status === "CANCELLED") {
    throw new Error("Invalid booking");
  }

  // Only admin or booking owner can cancel
  if (user.role !== "ADMIN" && booking.userId !== user.id) {
    throw new Error("Permission denied");
  }

  // Restore inventories according to recorded deductions
  await db.$transaction(async (tx) => {
    for (const d of booking.deductions || []) {
      await tx.bloodInventory.update({ where: { id: d.inventoryId }, data: { units: { increment: d.units } } });
    }
  });

  // Mark booking cancelled in file
  const updated = await updateBookingStatus(bookingId, "CANCELLED");
  return updated;
}

