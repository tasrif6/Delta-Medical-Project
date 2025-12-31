"use server";

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export default async function verifyAdmin() {
    const {userId} = await auth();

    if(!userId) {
        return false;
    }
    try {
        const user= await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        return user?.role==="ADMIN";
    } catch (error) {
        console.error("Failed to verify admin:", error.message)
        return false;
    }
}

export async function getPendingDoctors() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized admin")
    }
    try {
        const pendingDoctors = await db.user.findMany({
            where: {
                role: "DOCTOR",
                verificationStatus: "PENDING",
            },
            orderBy: {
                name: "desc",
            },
        });
        return { doctors: pendingDoctors };
    
    } catch (error) {
        throw new Error("Failed to fetch pending doctors")

    }
}

export async function getVerifiedDoctors() {
    const isAdmin = await verifyAdmin()
    if(!isAdmin) throw new Error("Not verified", error.message)

    try {
        const verifiedDoctors = await db.user.findMany({
            where: {
                role: "DOCTOR",
                verificationStatus: "VERIFIED",
            },
            orderBy: {
                name: "asc"
            }
        })
        return {doctors: verifiedDoctors};
    } catch (error) {
        console.error("Failed to get verified doctors:", error)
        return {error: "Failed to fetch verified doctors"};
    }
}

export async function updateDoctorStatus(formData){
    const isAdmin = await verifyAdmin();
    if(!isAdmin) throw new Error("Unauthorized");

    const doctorId = formData.get("doctorId");
    const status = formData.get("status");

    if(!doctorId || !["VERIFIED", "REJECTED"].includes(status)) {
        throw new Error("Invalid Input");
    }

    try {
        await db.user.update({
            where: {
                id: doctorId,
            },
            data: {
                verificationStatus: status,
            },
        });

        revalidatePath("/admin")
        return {success: true};
    } catch (error) {
        console.error("Failed to update doctor status:", error.message)
        throw new Error(`Failed to update doctor status: ${error.message}`)
    }
}

export async function updateDoctorActiveStatus(formData) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const doctorId = formData.get("doctorId");
    const suspend = formData.get("suspend") === "true";

    if (!doctorId) {
        throw new Error("Doctor ID is required")
    }

    try {
        const status = suspend ? "PENDING" : "VERIFIED";

        await db.user.update({
            where: {
                id: doctorId,
            },
            data: {
                verificationStatus: status,
            },
        });

        revalidatePath("/admin");
    } catch (error) {
        console.error("Failed to update doctor active status:", error);
        throw new Error(`Failed to update doctor status: ${error.message}`);
    }
}

export async function getPendingPayouts(){
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    try {
        const pendingPayouts = await db.payout.findMany({
            where: {
                status: "PROCESSING",
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                         name: true,
                          email: true,
                          specialty: true,
                          credits: true,
                    },
                },
            },

            orderBy: {
                createdAt : "desc",
            },
        });

        return { payouts: pendingPayouts};
    } catch (error) {
        console.error("Failed to fetch pending payouts:", error);
        throw new Error("Failed to fetch pending payouts");
    }
}

export async function approvePayout(formData) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const payoutId = formData.get("payoutId");

    if(!payoutId ) {
        throw new Error("Payout Id is required")
    }

    try {
        const {userId} = await auth();
        const admin = await db.user.findUnique({
            where: {
                clerkUserId: userId
            },
        });

        const payout = await db.payout.findUnique({
            where: {
                id: payoutId,
                status: "PROCESSING",
            },
            include: {
                doctor: true,
            },
        });

        if (!payout) {
            throw new Error("Payout request not found or already processed");
        }
        if (payout.doctor.credits < payout.credits) {
            throw new Error("Doctors doesn't have enough credits for this payout");
        }

        await db.$transaction(async (tx) => {
            await tx.payout.update({
                where: {
                    id: payoutId,
                },
                data: {
                    status: "PROCESSED",
                    processedAt: new Date(),
                    processedBy: admin?.id || "unknown",
                },
            }),

            await tx.user.update({
                where: {
                    id: payout.doctorId,
                },
                data: {
                    credits: {
                        decrement: payout.credits,
                    },
                },
            });

            await tx.creditTransaction.create({
                data: {
                    userId: payout.doctorId,
                    amount: -payout.credits,
                    type: "ADMIN_ADJUSTMENT",
                },
            });
    });

    revalidatePath("/admin")
    return {success: true};
    } catch (error) {
    console.error("Failed to approve payout:", error);
    throw new Error(`Failed to approve payout: ${error.message}`);
    }
}

// =======================
// Appointments / Patients handling
// =======================

/**
 * Fetch appointments with optional filters: status, doctorId, patientId
 */
export async function getAppointments(filters = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.patientId) where.patientId = filters.patientId;

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, email: true, specialty: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    return { appointments };
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
}

/**
 * Update appointment status (SCHEDULED | COMPLETED | CANCELLED)
 * Expects a FormData with appointmentId and status
 */
export async function updateAppointmentStatus(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const appointmentId = formData.get("appointmentId");
  const status = formData.get("status");

  if (!appointmentId || !["SCHEDULED", "COMPLETED", "CANCELLED"].includes(status)) {
    throw new Error("Invalid input");
  }

  try {
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update appointment status:", error);
    throw new Error("Failed to update appointment status");
  }
}

/**
 * Reschedule an appointment
 * Expects FormData: appointmentId, startTime (ISO), endTime (ISO)
 */
export async function rescheduleAppointment(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const appointmentId = formData.get("appointmentId");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  if (!appointmentId || !startTime || !endTime) {
    throw new Error("Invalid input");
  }

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new Error("Invalid date range");
    }

    await db.appointment.update({
      where: { id: appointmentId },
      data: { startTime: start, endTime: end },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to reschedule appointment:", error);
    throw new Error("Failed to reschedule appointment");
  }
}

// =======================
// Blood bank management
// =======================

/**
 * Create a new Blood Bank
 * Expects FormData: name, address, city, phone?, email?
 */
export async function createBloodBank(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const name = formData.get("name");
  const address = formData.get("address");
  const city = formData.get("city");
  const phone = formData.get("phone");
  const email = formData.get("email");

  if (!name || !city) {
    throw new Error("Name and city are required");
  }

  try {
    const { userId } = await auth();
    const admin = await db.user.findUnique({ where: { clerkUserId: userId } });

    const bank = await db.bloodBank.create({
      data: {
        name,
        address,
        city,
        phone,
        email,
        createdById: admin?.id || null,
      },
    });

    revalidatePath("/admin");
    return { success: true, bank };
  } catch (error) {
    console.error("Failed to create blood bank:", error);
    throw new Error("Failed to create blood bank");
  }
}

/**
 * Update a Blood Bank
 * Expects FormData: bloodBankId and fields to update
 */
export async function updateBloodBank(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const bankId = formData.get("bloodBankId");
  if (!bankId) throw new Error("bloodBankId is required");

  const data = {};
  ["name", "address", "city", "phone", "email"].forEach((field) => {
    const v = formData.get(field);
    if (v) data[field] = v;
  });

  try {
    await db.bloodBank.update({ where: { id: bankId }, data });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update blood bank:", error);
    throw new Error("Failed to update blood bank");
  }
}

/**
 * Add or increment blood inventory
 * Expects FormData: bloodBankId, bloodGroup, units (int)
 */
export async function addBloodInventory(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const bloodBankId = formData.get("bloodBankId");
  const bloodGroup = formData.get("bloodGroup");
  const units = parseInt(formData.get("units"), 10);

  if (!bloodBankId || !bloodGroup || Number.isNaN(units) || units <= 0) {
    throw new Error("Invalid input");
  }

  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.bloodInventory.findUnique({
        where: { bloodBankId_bloodGroup: { bloodBankId, bloodGroup } },
      });

      if (existing) {
        await tx.bloodInventory.update({
          where: { id: existing.id },
          data: { units: { increment: units } },
        });
      } else {
        await tx.bloodInventory.create({
          data: { bloodBankId, bloodGroup, units },
        });
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to add blood inventory:", error);
    throw new Error("Failed to add blood inventory");
  }
}

/**
 * Get all blood banks with inventory
 */
export async function getBloodBanks() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const banks = await db.bloodBank.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        inventory: true,
      },
      orderBy: { name: 'asc' },
    });

    return { banks };
  } catch (error) {
    console.error("Failed to get blood banks:", error);
    throw new Error("Failed to get blood banks");
  }
}

/**
 * Add a user to a blood bank (membership)
 * Expects FormData: bloodBankId, userId, role (ADMIN | STAFF | DONOR | MEMBER)
 */
export async function addBloodBankUser(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const bloodBankId = formData.get("bloodBankId");
  const userId = formData.get("userId");
  const role = formData.get("role") || "MEMBER";

  if (!bloodBankId || !userId) throw new Error("Invalid input");

  try {
    // ensure user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    await db.bloodBankUser.create({
      data: { bloodBankId, userId, role },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to add blood bank user:", error);
    // if unique constraint violated, provide a helpful message
    if (error?.code === 'P2002') {
      throw new Error('User is already a member of this blood bank');
    }
    throw new Error("Failed to add blood bank user");
  }
}
