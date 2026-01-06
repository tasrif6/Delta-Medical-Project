import {
  getAppointments,
  getBloodBanks,
  getPendingDoctors,
  getPendingPayouts,
  getVerifiedDoctors,
} from "@/actions/admin";
import { getBloodBookings } from "@/actions/blood-bank";
import { db } from "@/lib/prisma";
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { VerifiedDoctors } from "./_components/verified-doctors";
import { PendingDoctors } from "./_components/pending-doctors";
import { PendingPayouts } from "./_components/pending-payouts";
import { Patients } from "./_components/patients";
import { BloodBanks } from "./_components/blood-bank";

export default async function AdminPage() {
  const [
    pendingDoctorsData,
    verifiedDoctorsData,
    appointmentsData,
    bloodBankData,
    pendingPayoutsData,
    bookingsData,
  ] = await Promise.all([
    getPendingDoctors(),
    getVerifiedDoctors(),
    getAppointments(),
    getBloodBanks(),
    getPendingPayouts(),
    getBloodBookings({ user: { role: "ADMIN" } }),
  ]);

  // Enrich bookings with user info for display
  let enrichedBookings = [];
  try {
    const userIds = Array.from(new Set(bookingsData.map((b) => b.userId)));
    const users = userIds.length
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    enrichedBookings = bookingsData.map((b) => ({
      ...b,
      user: users.find((u) => u.id === b.userId) || { id: b.userId },
    }));
  } catch (e) {
    enrichedBookings = bookingsData.map((b) => ({
      ...b,
      user: { id: b.userId },
    }));
  }

  return (
    <div>
      <>
        <TabsContent value="pending" className="border-none p-0">
          <PendingDoctors doctors={pendingDoctorsData.doctors || []} />
        </TabsContent>

        <TabsContent value="doctors" className="border-none p-0">
          <VerifiedDoctors doctors={verifiedDoctorsData.doctors || []} />
        </TabsContent>
        <TabsContent value="patients" className="border-none p-0">
          <Patients appointments={appointmentsData.appointments || []} />
        </TabsContent>
        <TabsContent value="blood-bank" className="border-none p-0">
          <BloodBanks
            banks={bloodBankData.banks || []}
            bookings={enrichedBookings}
          />
        </TabsContent>
        <TabsContent value="payouts" className="border-none p-0">
          <PendingPayouts payouts={pendingPayoutsData.payouts || []} />
        </TabsContent>
      </>
    </div>
  );
}
