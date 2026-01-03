import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star, User } from "lucide-react";
import Link from "next/link";

export function DoctorCard({ doctor }) {
  return (
    <Card className="border hover:border-blue-600 transition-all">
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center shrink-0">
            {doctor.imageUrl ? (
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-blue-600" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h3 className="font-medium text-white text-lg">{doctor.name}</h3>
              <Badge
                variant="outline"
                className="text-white border-blue-800 self-start"
              >
                <Star className="h-6 w-3 mr-1" />
                Verified
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-1">
              {doctor.specialty} {doctor.experience} years experience
            </p>

            <div className="mt-4 line-clamp-2 text-sm text-muted-foreground mb-4">
              {doctor.description}
            </div>

            <Button
              asChild
              className="w-full bg-blue-800 hover:bg-white text-black mt-2 "
            >
              <Link
                href={`/doctors/${encodeURIComponent(doctor.specialty)}/${
                  doctor.id
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" /> View Profile & Book
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
