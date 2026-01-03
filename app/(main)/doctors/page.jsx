import { SPECIALTIES } from "@/lib/specialty";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function DoctorsPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center mb-8 text-center mt-20">
        <h1 className="text-3xl gradient-title font-bold mb-2">
          Find Your Doctor Here
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse by Speciality and view all available healthcare providers
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SPECIALTIES.map((specialty) => (
          <Link key={specialty.name} href={`/doctors/${specialty.name}`}>
            <Card className="cursor-pointer h-full border hover:border-blue-600 transition-all">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 flex items-center justify-center mb-4 gap-4">
                  <div className="text-blue-600">{specialty.icon}</div>
                  <h2 className="font-medium text-white">{specialty.name}</h2>
                </div>{" "}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
