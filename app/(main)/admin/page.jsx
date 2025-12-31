import {
  getAppointments,
  getBloodBanks,
  getPendingDoctors,
  getPendingPayouts,
  getVerifiedDoctors,
} from "@/actions/admin";
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
  ] = await Promise.all([
    getPendingDoctors(),
    getVerifiedDoctors(),
    getAppointments(),
    getBloodBanks(),
    getPendingPayouts(),
  ]);
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
          <BloodBanks banks={bloodBankData.banks || []} />
        </TabsContent>
        <TabsContent value="payouts" className="border-none p-0">
          <PendingPayouts payouts={pendingPayoutsData.payouts || []} />
        </TabsContent>
      </>
    </div>
  );
}
