"use client";
import { bookAppointment } from "@/actions/appointment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { Label } from "@radix-ui/react-label";
import { format } from "date-fns";
import {
  Clock,
  CreditCard,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AppointmentForm({ doctorId, slot, onBack, onComplete }) {
  const [description, setDescription] = useState("");

  //use the useFetch hook to handle loading, data and error states
  const { loading, data, error, fn: submitBooking } = useFetch(bookAppointment);

  // Show errors that come from the server action (useFetch also toasts, but show explicit handling here)
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to book appointment");
    }
  }, [error]);
  //Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    //create form data
    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("startTime", slot.startTime);
    formData.append("endTime", slot.endTime);
    formData.append("description", description);

    //Submit booking using the function from useFetch
    await submitBooking(formData);
  };

  //Handle response after booking attempt
  useEffect(() => {
    if (data) {
      if (data.success) {
        toast.success("Appointment booked successfully!");
        onComplete();
      }
      if (!data.success && data.error) {
        // show server-side error message when available
        toast.error(data.error || "Failed to book appointment");
      }
    }
  }, [data]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-lg border border-blue-900 space-y-3">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-white font-medium">
            {format(new Date(slot.startTime), "EEEE, MMMM d, yyyy")}
          </span>
        </div>

        <div className="flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-white">{slot.formatted}</span>
        </div>

        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-muted-foreground">
            Cost: <span className="text-white font-medium">2 Credits</span>
          </span>
        </div>

        <div className="space-y-6">
          <Label htmlFor="description">
            Describe your medical concern (optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Please provide any details about your medical concern or what you'd like to discuss in the appointment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background border-blue-900 h-32 mt-2"
          />
          <p className="text-sm text-muted-foreground">
            This information will be shared with the doctor before your
            appointment
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="border-blue-900  hover:bg-blue-600 cursor-pointer"
        >
          Change Time Slot
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gray-800 border-blue-900 hover:bg-blue-600 cursor-pointer text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </div>
    </form>
  );
}
