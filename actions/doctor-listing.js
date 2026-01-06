"use server"
import { db } from "@/lib/prisma";

export async function getDoctorsBySpeciality(specialty) {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        specialty: specialty,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { doctors };
  } catch (error) {
    console.error("Failed to fetch doctors by specialty: ", error);
    return { error: "Failed to fetch doctors" };
  }
}

export async function getAllVerifiedDoctors() {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
      orderBy: { name: "asc" },
    });
    return { doctors };
  } catch (error) {
    console.error("Failed to fetch verified doctors:", error);
    return { error: "Failed to fetch doctors" };
  }
}