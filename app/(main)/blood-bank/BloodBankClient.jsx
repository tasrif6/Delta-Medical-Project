"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const BLOOD_GROUPS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
];

export default function BloodBankClient({
  user,
  initialStock = [],
  initialBookings = [],
  actions,
}) {
  const [stock, setStock] = useState(initialStock);
  const [bookings, setBookings] = useState(initialBookings);
  const [form, setForm] = useState({
    bloodGroup: "",
    quantity: "",
    emergency: false,
  });

  const refresh = async () => {
    try {
      const res = await actions.refresh();
      if (res) {
        setStock(res.stock || []);
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error("refresh failed", err);
    }
  };

  const handleAddStock = async () => {
    if (!form.bloodGroup || !form.quantity) {
      alert("Please select blood group and quantity.");
      return;
    }

    try {
      const res = await actions.addStock({
        bloodGroup: form.bloodGroup,
        quantity: Number(form.quantity),
      });
      if (res) {
        setStock(res.stock || []);
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to add stock");
    }
  };

  const handleRemoveStock = async () => {
    if (!form.bloodGroup || !form.quantity) {
      alert("Please select blood group and quantity.");
      return;
    }

    try {
      const res = await actions.removeStock({
        bloodGroup: form.bloodGroup,
        quantity: Number(form.quantity),
      });
      if (res) {
        setStock(res.stock || []);
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to remove stock");
    }
  };

  const handleBookBlood = async () => {
    if (!form.bloodGroup || !form.quantity) {
      alert("Please select blood group and quantity.");
      return;
    }

    try {
      const res = await actions.book({
        bloodGroup: form.bloodGroup,
        quantity: Number(form.quantity),
        emergency: form.emergency,
      });
      if (res) {
        setStock(res.stock || []);
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to book blood");
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await actions.cancel({ id });
      if (res) {
        setStock(res.stock || []);
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="space-y-8 mt-20 ml-2">
      <section>
        <h2 className="text-xl font-bold">Blood Stock</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 border">
          {stock.map((s) => (
            <div
              key={s.bloodGroup}
              className="border hover:border-blue-800 p-4 rounded"
            >
              <p className="font-semibold">{s.bloodGroup}</p>
              <p>{s.quantity} bags</p>
            </div>
          ))}
        </div>
      </section>

      {user?.role === "ADMIN" && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Manage Blood Stock</h2>

          <Select
            value={form.bloodGroup}
            onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Blood Group (e.g. O+)" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(form.quantity || "")}
            onValueChange={(v) => setForm({ ...form, quantity: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Quantity" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              onClick={handleAddStock}
              className="bg-blue-600 hover:bg-blue-800 ml-2 text-white cursor-pointer "
            >
              Add
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveStock}
              className="text-white cursor-pointer ml-1"
            >
              Remove
            </Button>
          </div>
        </section>
      )}

      {user && (
        <section className="space-y-4 mt-4">
          <h2 className="text-xl font-bold">Book Blood</h2>

          <Select
            value={form.bloodGroup}
            onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(form.quantity || "")}
            onValueChange={(v) => setForm({ ...form, quantity: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Quantity" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex items-center gap-1 ml-2 w-6 h-6 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) =>
                setForm({ ...form, emergency: e.target.checked })
              }
            />
            Emergency
          </label>

          <div className="flex gap-2">
            <Button
              onClick={handleBookBlood}
              className="bg-blue-600 hover:bg-blue-800 ml-2 text-white cursor-pointer"
            >
              Book Blood
            </Button>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mt-2">Blood Bookings</h2>

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

              {(user?.role === "ADMIN" || b.userId === user?.id) && (
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
