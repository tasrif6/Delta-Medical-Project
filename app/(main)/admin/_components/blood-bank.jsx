import React from "react";

export function BloodBanks({ banks = [] }) {
  if (!banks.length) {
    return <div className="p-6">No blood banks found.</div>;
  }

  return (
    <div className="space-y-6 p-4">
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
            {/* TODO: wire to create/add inventory/update endpoints */}
            <button className="btn btn-sm">Add Inventory</button>
            <button className="btn btn-sm">Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
}
