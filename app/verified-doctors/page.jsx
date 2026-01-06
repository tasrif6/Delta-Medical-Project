import { getAllVerifiedDoctors } from "@/actions/doctor-listing";
import { PageHeader } from "@/components/page-header";
import { DoctorCard } from "@/app/(main)/doctors/components/doctor-card";

export default async function VerifiedDoctorsPage() {
  const { doctors, error } = await getAllVerifiedDoctors();

  return (
    <div className="container ml-4 space-y-6 mt-20">
      <PageHeader title="Verified Doctors" backLink="/" backLabel="Home" />
      {doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-medium text-white mb-2 gradient-title">
            No Verified Doctors
          </h3>
          <p className="text-muted-foreground text-lg">
            There are currently no verified doctors. Check back later.
          </p>
        </div>
      )}
    </div>
  );
}
