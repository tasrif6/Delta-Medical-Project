"use client";

import { useEffect, useState } from "react";
import {
  addBloodStock,
  removeBloodStock,
  bookBlood,
  cancelBloodBooking,
} from "@/actions/blood-bank";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function BloodBankPage() {
  const [user, setUser] = useState(null);
  const [stock, setStock] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    bloodGroup: "",
    quantity: "",
    emergency: false,
  });

  /* ---------------- Fetch initial data ---------------- */
  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const stockRes = await fetch("/api/blood-stock").then((res) =>
        res.json()
      );
      const bookingRes = await fetch("/api/blood-bookings").then((res) =>
        res.json()
      );

      setStock(stockRes);
      setBookings(bookingRes);
    }
    loadData();
  }, []);

  if (!user) return null;

  /* ---------------- Handlers ---------------- */
  const handleAddStock = async () => {
    await addBloodStock({
      bloodGroup: form.bloodGroup,
      quantity: Number(form.quantity),
    });
  };

  const handleRemoveStock = async () => {
    await removeBloodStock({
      bloodGroup: form.bloodGroup,
      quantity: Number(form.quantity),
    });
  };

  const handleBookBlood = async () => {
    await bookBlood({
      bloodGroup: form.bloodGroup,
      quantity: Number(form.quantity),
      emergency: form.emergency,
    });
  };

  const handleCancel = async (id) => {
    await cancelBloodBooking(id);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-8">
      {/* ---------------- Blood Stock ---------------- */}
      <section>
        <h2 className="text-xl font-bold">Blood Stock</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {stock.map((s) => (
            <div key={s.id} className="border p-4 rounded">
              <p className="font-semibold">{s.bloodGroup}</p>
              <p>{s.quantity} bags</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Admin Controls ---------------- */}
      {user.role === "ADMIN" && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Manage Blood Stock</h2>

          <Input
            placeholder="Blood Group (e.g. O+)"
            onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Quantity"
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <div className="flex gap-2">
            <Button onClick={handleAddStock}>Add Stock</Button>
            <Button variant="destructive" onClick={handleRemoveStock}>
              Remove Stock
            </Button>
          </div>
        </section>
      )}

      {/* ---------------- Booking Section ---------------- */}
      {["DOCTOR", "PATIENT"].includes(user.role) && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Book Blood</h2>

          <Input
            placeholder="Blood Group"
            onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Quantity"
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={(e) =>
                setForm({ ...form, emergency: e.target.checked })
              }
            />
            Emergency
          </label>

          <Button onClick={handleBookBlood}>Book Blood</Button>
        </section>
      )}

      {/* ---------------- Bookings ---------------- */}
      <section>
        <h2 className="text-xl font-bold">Blood Bookings</h2>

        <div className="space-y-3 mt-4">
          {bookings.map((b) => (
            <div key={b.id} className="border p-4 rounded flex justify-between">
              <div>
                <p>
                  {b.bloodGroup} — {b.quantity} bags
                </p>
                <Badge
                  variant={
                    b.priority === "EMERGENCY" ? "destructive" : "outline"
                  }
                >
                  {b.priority}
                </Badge>
              </div>

              {(user.role === "ADMIN" || b.userId === user.id) && (
                <Button variant="outline" onClick={() => handleCancel(b.id)}>
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
