import { PricingTable } from "@clerk/nextjs";
import React from "react";
import { Card, CardContent } from "./ui/card";

const Pricing = () => {
  return (
    <div>
      <Card className=" border-blue-800 shadow-lg bg-gradient-to-b from-blue-800 to-transparent">
        <CardContent className="p-4 md:p-6">
          <PricingTable
            checkOutProps={{
              appearance: {
                elements: {
                  drawerRoot: {
                    zIndex: 200,
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;
