import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, X } from "lucide-react";
import React from "react";

export function Patients({ appointments = [] }) {
  if (!appointments.length) {
    return <div className="p-6">No appointments found.</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold text-white">
              Manage Appointments
            </CardTitle>
            <CardDescription>
              View and manage all patient appointments
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div>No appointments available.</div>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt.id}
                className="rounded-md border p-4 bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="text-lg text-muted-foreground">
                    <strong>Patient:</strong>{" "}
                    {appt.patient?.name || appt.patient?.email}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    <strong>Doctor:</strong> {appt.doctor?.name} (
                    {appt.doctor?.specialty})
                  </div>
                  <div className="text-lg text-muted-foreground">
                    <strong>When:</strong>{" "}
                    {new Date(appt.startTime).toLocaleString()}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    <strong>Status:</strong> {appt.status}
                  </div>
                  {appt.patientDescription && (
                    <div className="mt-2 text-lg">
                      {appt.patientDescription}
                    </div>
                  )}
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                  {/* TODO: wire these to server actions (updateAppointmentStatus/rescheduleAppointment) */}
                  <Button className="bg-blue-600 hover:bg-blue-800 text-white cursor-pointer flex items-center gap-1">
                    <CheckCircle />
                    Mark Completed
                  </Button>
                  <Button className="bg-red-600 text-white cursor-pointer flex items-center gap-1">
                    <X />
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-800 text-white cursor-pointer flex items-center gap-1">
                    <Clock />
                    Reschedule
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
