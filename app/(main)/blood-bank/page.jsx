import { getCurrentUser } from "@/actions/onboarding";
import {
  getBloodStock,
  getBloodBookings,
  addBloodStock,
  removeBloodStock,
  bookBlood,
  cancelBloodBooking,
} from "@/actions/blood-bank";
import BloodBankClient from "./BloodBankClient";

export default async function BloodBankPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  const stock = await getBloodStock();
  const bookings = await getBloodBookings({ user });

  async function refresh() {
    "use server";
    const s = await getBloodStock();
    const b = await getBloodBookings({ user });
    return { stock: s, bookings: b };
  }

  async function addStockAction({ bloodGroup, quantity }) {
    "use server";
    await addBloodStock({ bloodGroup, quantity });
    return await refresh();
  }

  async function removeStockAction({ bloodGroup, quantity }) {
    "use server";
    await removeBloodStock({ bloodGroup, quantity });
    return await refresh();
  }

  async function bookBloodAction({ bloodGroup, quantity, emergency }) {
    "use server";
    await bookBlood({ bloodGroup, quantity, emergency });
    return await refresh();
  }

  async function cancelBookingAction({ id }) {
    "use server";
    await cancelBloodBooking(id);
    return await refresh();
  }

  return (
    <BloodBankClient
      user={user}
      initialStock={stock}
      initialBookings={bookings}
      actions={{
        addStock: addStockAction,
        removeStock: removeStockAction,
        book: bookBloodAction,
        cancel: cancelBookingAction,
      }}
    />
  );
}
