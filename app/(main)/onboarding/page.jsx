"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Stethoscope, User } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { setUserRole } from "@/actions/onboarding";
import { doctorFormSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPECIALTIES } from "@/lib/specialty";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function OnBoardingPage() {
  const [step, setStep] = useState("choose-role");
  const router = useRouter();

  //custom hook for user role server action
  const { loading, data, fn: submitUserRole } = useFetch(setUserRole);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      specialty: "",
      experience: undefined,
      credentialUrl: "",
      description: "",
    },
  });

  //Watch speciality value for controlled select component
  const specialtyValue = watch("specialty");

  //Handle patient role selection
  const handlePatientSelection = async () => {
    if (loading) return;
    const formData = new FormData();
    formData.append("role", "PATIENT");

    await submitUserRole(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      router.push(data.redirect);
    }
  }, [data]);

  //Added missing onDoctorSubmit function
  const onDoctorSubmit = async (data) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("role", "DOCTOR");
    formData.append("specialty", data.specialty);
    formData.append("experience", data.experience.toString());
    formData.append("credentialUrl", data.credentialUrl);
    formData.append("description", data.description);

    await submitUserRole(formData);
  };

  //Role selection screen
  if (step === "choose-role") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card
          className="border-blue-800 hover:border-blue-500 cursor-pointer transition-all"
          onClick={() => !loading && handlePatientSelection()}
        >
          <CardContent className="pt-4 pb-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold text-white mb-2">
              Join as a Patient
            </CardTitle>
            <CardDescription className="mb-4">
              Book appointments, consult with doctors and manage your healthcare
              journey
            </CardDescription>

            <Button
              className="w-full cursor-pointer bg-blue-600 text-white hover:bg-white hover:text-black"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue as Patient"
              )}{" "}
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-blue-800 hover:border-blue-500 cursor-pointer transition-all"
          onClick={() => !loading && setStep("doctor-form")}
        >
          <CardContent className="pt-4 pb-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full mb-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>

            <CardTitle className="text-xl font-bold text-white mb-2 ">
              Join as a Doctor
            </CardTitle>
            <CardDescription className="mb-2">
              Create your professional profile, set your availability, and
              provide consultations
            </CardDescription>
            <Button
              className="w-full mt-2 bg-blue-600 hover:bg-white text-white hover:text-black cursor-pointer"
              disabled={loading}
            >
              Continue as Doctor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "doctor-form") {
    return (
      //Doctor form
      <Card className="border-blue-800 mt-4">
        <CardContent className="pt-6 mb-4">
          <div className="mb-8">
            <CardTitle className="text-2xl font-bold text-white mb-2 ">
              Complete Your Doctor Profile
            </CardTitle>
            <CardDescription className="mb-2">
              Create your professional profile, set your availability, and
              provide consultations
            </CardDescription>
          </div>

          <form onSubmit={handleSubmit(onDoctorSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="specialty">Medical Speciality</Label>
              <Select
                value={specialtyValue}
                onValueChange={(value) => setValue("specialty", value)}
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  {" "}
                  {SPECIALTIES.map((spec) => (
                    <SelectItem
                      key={spec.name}
                      value={spec.name}
                      className=" cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-blue-600">{spec.icon}</span>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                placeholder="e.g- 5"
                {...register("experience", { valueAsNumber: true })}
              />
              {errors.experience && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {" "}
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentialUrl">Link to Credential Document</Label>
              <Input
                id="credentialUrl"
                type="url"
                placeholder="Please provide a drive link to your medical degree or certification"
                {...register("credentialUrl")}
              />
              {errors.credentialUrl && (
                <p className="text-sm font-medium text-red-500 mt-1 ">
                  {errors.credentialUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your expertise, services, and approach to patient care..."
                rows="4"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("choose-role")}
                className="border-blue-600 cursor-pointer"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="cursor-pointer bg-blue-600 hover:bg-white text-white hover:text-black"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
}
