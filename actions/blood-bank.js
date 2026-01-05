"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "./onboarding";

/* ---------------------------------------
   ADMIN: Add blood stock
--------------------------------------- */
export async function addBloodStock({ bloodGroup, quantity }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  return await db.bloodStock.upsert({
    where: { bloodGroup },
    update: { quantity: { increment: quantity } },
    create: { bloodGroup, quantity },
  });
}

/* ---------------------------------------
   ADMIN: Remove blood stock
--------------------------------------- */
export async function removeBloodStock({ bloodGroup, quantity }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const stock = await db.bloodStock.findUnique({ where: { bloodGroup } });

  if (!stock || stock.quantity < quantity) {
    throw new Error("Insufficient stock");
  }

  return await db.bloodStock.update({
    where: { bloodGroup },
    data: { quantity: { decrement: quantity } },
  });
}

/* ---------------------------------------
   DOCTOR & PATIENT: Book blood
--------------------------------------- */
export async function bookBlood({
  bloodGroup,
  quantity,
  emergency = false,
}) {
  const user = await getCurrentUser();

  if (!user || !["DOCTOR", "PATIENT"].includes(user.role)) {
    throw new Error("Unauthorized");
  }

  if (quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  return await db.$transaction(async (tx) => {
    const stock = await tx.bloodStock.findUnique({
      where: { bloodGroup },
    });

    if (!stock || stock.quantity < quantity) {
      throw new Error("Not enough blood available");
    }

    // Deduct stock
    await tx.bloodStock.update({
      where: { bloodGroup },
      data: { quantity: { decrement: quantity } },
    });

    // Create booking
    return await tx.bloodBooking.create({
      data: {
        userId: user.id,
        bloodGroup,
        quantity,
        priority: emergency ? "EMERGENCY" : "NORMAL",
        status: "ACTIVE",
      },
    });
  });
}

/* ---------------------------------------
   CANCEL BLOOD BOOKING
--------------------------------------- */
export async function cancelBloodBooking(bookingId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return await db.$transaction(async (tx) => {
    const booking = await tx.bloodBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.status === "CANCELLED") {
      throw new Error("Invalid booking");
    }

    // Only admin or booking owner can cancel
    if (user.role !== "ADMIN" && booking.userId !== user.id) {
      throw new Error("Permission denied");
    }

    // Restore stock
    await tx.bloodStock.update({
      where: { bloodGroup: booking.bloodGroup },
      data: { quantity: { increment: booking.quantity } },
    });

    // Mark booking cancelled
    return await tx.bloodBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  });
}
