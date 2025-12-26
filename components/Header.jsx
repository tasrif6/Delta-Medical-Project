import React from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Image from "next/image";
import { CheckUser } from "@/lib/CheckUser";

const Header = async () => {
  const user = await CheckUser();
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
          <SignedIn>
            {/* Admin */}
            {user?.role === "Admin" && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  clasName="hidden md:inline-flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            {/* Patient */}
            {user?.role === "Patient" && (
              <Link href="/appointments">
                <Button variant="outline" className="h-4 w-4">
                  {" "}
                  My Appointments
                </Button>
              </Link>
            )}

            {/* Doctors */}

            {user?.role === "Doctor" && (
              <Link href="/doctor">
                <Button variant="outline" className="h-4 w-4">
                  Doctor Dashboard
                </Button>
              </Link>
            )}
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button
                variant="secondary"
                className="cursor-pointer bg-blue-600 hover:bg-white hover:text-black"
              >
                Login
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton className="w-20 h-20" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
