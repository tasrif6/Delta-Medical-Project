import Pricing from "@/components/Pricing";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const PricingPage = () => {
  return (
    <div className="container mx-auto px-4 py-1">
      <div className="flex justify-start mt-15 mb-2">
        <Link
          href="/"
          className="flex items-center hover:text-white transition-colors m-10 text-lg text-muted-foreground"
        >
          {" "}
          <ArrowLeft />
          Back to Home
        </Link>
      </div>
      <div className="max-w-full text-center mx-auto mb-8 justify-center items-center">
        <Badge
          variant="outline"
          className="bg-blue-600 px-6 py-2 font-bold text-xl"
        >
          Affordable Healthcare
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-4">
          Subsciption Packages
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {" "}
          Choose the perfect consultation package that fits your healthcare
          needs with no hidden fees or long-term commitements
        </p>
      </div>

      <Pricing />

      <div className="max-w-3xl mx-auto mt-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Questions? We're Here to Help
        </h2>
        <p className="text-muted-forground">
          {" "}
          Contact our support team at delta.medical.support@deltamedical.com
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
