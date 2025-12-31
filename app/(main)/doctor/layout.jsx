import { PageHeader } from "@/components/page-header";
import { Stethoscope } from "lucide-react";

export const metadata = {
  title: "Delta Medical College Hospital",
  description: "Manage your appointments and availability.",
};
export default async function DoctorDashboardLayout({ children }) {
  return (
    <div className="container mx-auto px-12 py-30">
      <PageHeader icon={<Stethoscope />} title={"Doctor Dashboard"} />

      {children}
    </div>
  );
}
