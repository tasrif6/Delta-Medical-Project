"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SquarePen } from "lucide-react";

export function BloodBanks({ banks = [], bookings = [] }) {
  // helper that adds a single user to this bank via API
  async function addUserToBank(bloodBankId, userId, role = "MEMBER") {
    try {
      const res = await fetch("/api/admin/blood-bank/user/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodBankId, userId, role }),
      });
      const d = await res.json();
      if (d?.success) {
        alert("User added to blood bank");
        window.location.reload();
      } else {
        alert(d?.error || "Failed to add user");
      }
    } catch (err) {
      alert(err.message || "Failed to add user");
    }
  }

  // Adds all unique booking requesters to a bank
  async function addAllRequestersToBank(bloodBankId) {
    const ids = Array.from(new Set(bookings.map((b) => b.userId)));
    if (!ids.length) return alert("No requesters");
    if (!confirm(`Add ${ids.length} user(s) to this bank?`)) return;

    for (const id of ids) {
      // call sequentially to avoid rate issues and to show stopping on error
      await addUserToBank(bloodBankId, id);
    }
  }

  // Delete / reject a blood booking request
  async function deleteRequest(bookingId) {
    if (!confirm("Are you sure you want to reject this request?")) return;

    try {
      const res = await fetch("/api/admin/blood-booking/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const d = await res.json();
      if (d?.success) {
        alert("Request rejected");
        window.location.reload();
      } else {
        alert(d?.error || "Failed to reject request");
      }
    } catch (err) {
      alert(err.message || "Failed to reject request");
    }
  }

  return (
    <div>
      <Card>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No request pending
            </div>
          ) : (
            <div className="rounded-md border bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Blood Requests</div>
                <div className="text-sm text-muted-foreground">
                  {bookings.length} request(s)
                </div>
              </div>

              <div className="mt-2 grid gap-2">
                {bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="text-sm">
                      <div className="font-medium">
                        {bk.user?.name || bk.user?.email || bk.user?.id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {bk.bloodGroup} · {bk.quantity} unit(s)
                      </div>
                    </div>
                    <div>
                      <Button
                        className="bg-blue-600 text-white hover:bg-blue-800 cursor-pointer"
                        onClick={() => addUserToBank(banks[0]?.id, bk.userId)}
                      >
                        Add Member
                      </Button>
                      <Button
                        className="bg-red-600 text-white ml-2 cursor-pointer"
                        onClick={() => deleteRequest(bk.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {banks.map((b) => (
          <div key={b.id} className="rounded-md border bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{b.name}</div>
                <div className="text-sm text-muted-foreground">{b.city}</div>
                <div className="text-sm text-muted-foreground">{b.address}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                Created by: {b.createdBy?.name || b.createdBy?.email}
              </div>
            </div>

            <div className="mt-4">
              <div className="font-medium mb-2">Inventory</div>
              {b.inventory && b.inventory.length ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {b.inventory.map((inv) => (
                    <div key={inv.id} className="p-2 rounded border">
                      <div className="text-sm">
                        {inv.bloodGroup
                          .replace(/_/g, " ")
                          .replace(/POS/g, "+")
                          .replace(/NEG/g, "-")}
                      </div>
                      <div className="text-sm font-semibold">
                        {inv.units} units
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm">No inventory</div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-800 cursor-pointer"
                onClick={async () => {
                  const bloodGroup = window.prompt(
                    "Blood group (e.g. O_POS or A_NEG)"
                  );
                  const units = window.prompt("Units to add (number)");
                  if (!bloodGroup || !units) return;
                  const res = await fetch("/api/admin/blood-inventory/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      bloodBankId: b.id,
                      bloodGroup,
                      units: Number(units),
                    }),
                  });
                  const data = await res.json();
                  if (data?.success) {
                    alert("Inventory updated");
                    window.location.reload();
                  } else {
                    alert(data?.error || "Failed");
                  }
                }}
              >
                Add Inventory
              </Button>
              <Button
                className="bg-white text-black hover:bg-blue-600 hover:text-white cursor-pointer"
                onClick={() => {
                  const newName = window.prompt("New name", b.name);
                  if (!newName) return;
                  fetch("/api/admin/blood-bank/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      bloodBankId: b.id,
                      name: newName,
                    }),
                  }).then(async (r) => {
                    const d = await r.json();
                    if (d?.success) {
                      alert("Updated");
                      window.location.reload();
                    } else alert(d?.error || "Failed");
                  });
                }}
              >
                <SquarePen />
                Edit
              </Button>

              <Button
                className="bg-blue-600 text-white hover:bg-blue-800 cursor-pointer"
                onClick={() => addAllRequestersToBank(b.id)}
              >
                Add all requesters
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
