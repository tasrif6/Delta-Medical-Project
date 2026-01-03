import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign } from "lucide-react";
import { getDoctorAppointments, getDoctorAvailability } from "@/actions/doctor";
import { getDoctorEarnings, getDoctorPayouts } from "@/actions/payout";
import { DoctorEarnings } from "./_components/earnings";
import { AvailabilitySettings } from "./_components/availability-settings";
import { DoctorAppointmentsList } from "./_components/appointment-settings";

export default async function DoctorDashboardPage() {
  const user = await getCurrentUser();

  const [appointmentsData, availabilityData, earningsData, payoutsData] =
    await Promise.all([
      getDoctorAppointments(),
      getDoctorAvailability(),
      getDoctorEarnings(),
      getDoctorPayouts(),
    ]);
  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/doctor/verification");
  }

  return (
    <div className="container">
      <Tabs
        defaultValue="earnings"
        className="justify-center items-center w-400 "
      >
        <TabsList className=" cursor-pointer bg-muted border p-2 md:p-2 rounded md:space-y-2 sm:space-x-2 md:space-x-2">
          <TabsTrigger
            value="earnings"
            className="flex-1
            md:flex
            md:items-center
            md:justify-center
            md:px-4
            md:py-3
            w-full"
          >
            <DollarSign className="h-4 w-4 mr-2 hidden md:inline cursor-pointer" />
            <span className="cursor-pointer">Earnings</span>
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="flex-1
            md:flex
            md:items-center
            md:justify-center
            md:px-4
            md:py-3
            w-full"
          >
            {" "}
            <Calendar className="h-4 w-4 mr-2 hidden md:inline cursor-pointer" />
            <span className="cursor-pointer">Appoinments</span>
          </TabsTrigger>
          <TabsTrigger
            value="availability"
            className="flex-1
            md:flex
            md:items-center
            md:justify-center
            md:px-4
            md:py-3
            w-full"
          >
            <Clock className="h-4 w-4 mr-2 hidden md:inline cursor-pointer" />
            <span className="cursor-pointer">Availability</span>
          </TabsTrigger>
        </TabsList>
        <div className="md:col-span-3">
          <TabsContent value="appointments" className="border-none p-0">
            <DoctorAppointmentsList
              appointments={appointmentsData.appointments || []}
            />
          </TabsContent>
          <TabsContent value="availability" className="border-none p-2">
            <AvailabilitySettings slots={availabilityData.slots || []} />
          </TabsContent>
          <TabsContent value="earnings" className="border-none p-2">
            <DoctorEarnings
              earnings={earningsData.earnings || []}
              payouts={payoutsData.payouts || []}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
