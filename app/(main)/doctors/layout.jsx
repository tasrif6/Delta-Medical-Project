import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Find Doctors - DMC",
  description: "Browse and book appointments with top healthcare providers",
};

export default async function DoctorsLayout({ children }) {
  const user = await getCurrentUser();
  if (user?.role === "DOCTOR") {
    redirect("/doctor");
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
