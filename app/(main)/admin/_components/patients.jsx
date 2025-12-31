import React from "react";

export function Patients({ appointments = [] }) {
  if (!appointments.length) {
    return <div className="p-6">No appointments found.</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="rounded-md border p-4 bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="text-sm text-muted-foreground">
              <strong>Patient:</strong>{" "}
              {appt.patient?.name || appt.patient?.email}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Doctor:</strong> {appt.doctor?.name} (
              {appt.doctor?.specialty})
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>When:</strong> {new Date(appt.startTime).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Status:</strong> {appt.status}
            </div>
            {appt.patientDescription && (
              <div className="mt-2 text-sm">{appt.patientDescription}</div>
            )}
          </div>

          <div className="mt-4 md:mt-0 flex gap-2">
            {/* TODO: wire these to server actions (updateAppointmentStatus/rescheduleAppointment) */}
            <button className="btn btn-sm">Mark Completed</button>
            <button className="btn btn-sm">Cancel</button>
            <button className="btn btn-sm">Reschedule</button>
          </div>
        </div>
      ))}
    </div>
  );
}
