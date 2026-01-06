"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function FeatureCard({ feature }) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleClick = () => {
    const title = feature.title;

    if (title === "Create Your Profile") {
      if (!isSignedIn) {
        router.push("/sign-up");
      } else {
        router.push("/onboarding");
      }
      return;
    }

    if (title === "Book Appointments") {
      router.push("/onboarding");
      return;
    }

    if (title === "Blood Bank") {
      router.push("/blood-bank");
      return;
    }

    if (title === "Verified Doctors") {
      router.push("/verified-doctors");
      return;
    }

    // default: do nothing (e.g., Video Consultation, Credits)
  };

  return (
    <Card
      className="border hover:border-blue-600 transition-all duration-400 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <CardHeader className="pb-2">
        <div className="p-3 rounded-lg w-fit mb-2">{feature.icon}</div>
        <CardTitle className="text-xl font-bold text-white">
          {feature.title}
        </CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
