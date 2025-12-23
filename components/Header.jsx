import React from "react";
import Link from "next/link";
import Img from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto px-4 h-20 flex items-center ">
        <Link href="/">
          <Img
            src="/logo.png"
            alt="main-logo"
            width={200}
            height={60}
            className="h-20 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center space-x-2">
          <SignedOut>
            <SignInButton>
              <Button varinat="secondary">SignIn</Button>
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
