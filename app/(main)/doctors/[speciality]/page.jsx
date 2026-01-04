import { getDoctorsBySpeciality } from "@/actions/doctor-listing";
import { PageHeader } from "@/components/page-header";
import { redirect } from "next/navigation";
import { DoctorCard } from "../components/doctor-card";

export default async function SpecialityPage({ params }) {
  const { specialty } = await params;

  // if (!decodedSpeciality) {
  //   redirect("/doctors");
  // }

  const { doctors, error } = await getDoctorsBySpeciality(specialty);

  if (error) {
    console.error("Error fetching doctors:", error);
  }

  return (
    <div className="space-y-6 mt-20">
      <PageHeader
        title={specialty}
        backLink="/doctors"
        backLabel="All Specialties"
      />
      {doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-medium text-white mb-2 gradient-title">
            No Doctors Available
          </h3>
          <p className="text-muted-foreground text-lg">
            There are currently no verified doctors in this speciality. Please
            check back later or choose another specialty.
          </p>
        </div>
      )}
    </div>
  );
}
