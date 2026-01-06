import React from "react";
import { Button } from "./ui/button";

export default function Footer() {
  return (
    <div className="bg-gradient-to-b from-blue-800 to-transparent text-white px-4 py-4 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* LEFT – Logo & Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Delta Medical" className="w-12 h-12" />
            <h2 className="text-xl font-bold text-white">
              Delta Medical College Hospital
            </h2>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed">
            A modern healthcare platform connecting patients, doctors, and blood
            banks with efficiency, trust, and care.
          </p>
        </div>

        {/* MIDDLE – Contact Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Contact Info</h3>

          <div className="text-sm space-y-2 text-gray-400">
            <p>
              📍 <span className="ml-1">Mirpur, Dhaka</span>
            </p>
            <p>
              📧 <span className="ml-1">support@deltamedical.com</span>
            </p>
            <p>
              📞 <span className="ml-1">+880 1XXX-XXXXXX</span>
            </p>
          </div>
        </div>

        {/* RIGHT – Contact Form */}
        <div className="container border border-blue-900 px-4 py-2 space-y-4">
          <h3 className="text-lg font-semibold text-white rounded">
            Send a Message
          </h3>

          <form className="space-y-3">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-600"
            />
            <textarea
              rows={3}
              placeholder="Your message"
              className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-600"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded text-white font-medium cursor-pointer"
            >
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Delta Medical Hospital. All rights
            reserved.
          </p>
          <p>
            Built by ©
            <span className="text-white font-medium">Md Tasrif Khan</span>
          </p>
        </div>
      </div>
    </div>
  );
}
