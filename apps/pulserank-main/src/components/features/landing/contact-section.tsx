"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Trial request submitted:", email);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Interested but not yet completely convinced? We may have a solution
            for you.
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            We occasionally send out invitations to test the tool for 7 days.
          </p>
          <p className="text-lg text-gray-500 mb-2">
            <span className="font-semibold text-orange-600">
              (Due to high demand, this may take some time)
            </span>
          </p>
          <p className="text-base text-gray-500">
            Join our waiting list and we'll notify you when a spot becomes
            available.
          </p>
        </div>

        {/* Form Box */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Trial request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-600 text-white hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                Sign me up!
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
