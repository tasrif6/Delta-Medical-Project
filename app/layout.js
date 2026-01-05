export const runtime = "nodejs";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Delta Medical",
  description: "Connect with Authorized and Specilized Doctors Anytime, Anywhere",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{theme: dark,}}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
          
          {/* header */}
              <Header />
              <main className="min-h-screen pt-20 mt-20">{children}</main>
              <Toaster />
          {/* footer */}
              <footer>
                <div className=" justify-center items-center flex border bg-white text-black mx-auto px-4 ">
                  <p>
                    Made by Md Tasrif Khan
                  </p>
                </div>
              </footer>
          </ThemeProvider>
        </body>
      </html>
  </ClerkProvider>
  );
}
