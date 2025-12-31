import React from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Image from "next/image";
import { CheckUser } from "@/lib/CheckUser";
import { Calendar, CreditCard, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge } from "./ui/badge";
import { CheckCredits } from "@/actions/credits";

const Header = async () => {
  const user = await CheckUser();
  if (user?.role === "PATIENT") {
    await CheckCredits(user);
  }
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-backdrop-filter:bg-background/60">
      <nav className="w-full mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo.png"
            alt="main-logo"
            width={200}
            height={60}
            className="h-20 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button
              variant="outline"
              className="hover:underline md:inline-flex items-center gap-2 cursor-pointer"
            >
              Home
            </Button>
          </Link>
          <SignedIn>
            {/* Admin */}
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2 hover:underline cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Admin Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {/* Patient */}
            {user?.role === "PATIENT" && (
              <Link href="/appointments">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2 cursor-pointer hover:underline"
                >
                  <Calendar className="h-4 w-4" />
                  My Appointments
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Doctors */}
            {user?.role === "DOCTOR" && (
              <Link href="/doctors">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center hover:underline cursor-pointer gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Stethoscope className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </SignedIn>

          {(!user || user?.role !== "ADMIN") && (
            <Link href={user?.role === "PATIENT" ? "/pricing" : "/doctors"}>
              <Badge
                variant="outline"
                className="h-8 md:inline-flex hover:underline text-sm px-3 py-1 items-center gap-2"
              >
                <CreditCard />
                <span>
                  {" "}
                  {user && user.role !== "ADMIN" ? (
                    <>
                      {user.credits}{" "}
                      <span>
                        {user?.role === "PATIENT"
                          ? "Credits"
                          : "Earned Credits"}
                      </span>
                    </>
                  ) : (
                    <>Pricing</>
                  )}
                </span>
              </Badge>
            </Link>
          )}

          <SignedOut>
            <SignInButton>
              <Button
                variant="secondary"
                className="cursor-pointer bg-blue-600 hover:bg-white hover:text-black hover:underline"
              >
                Login
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton className="w-30 h-30" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
