"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section
      className="w-full min-h-[50vh] flex items-center bg-cover bg-center bg-no-repeat justify-center px-4 py-16"
      style={{
        backgroundImage: "url('/images/hero.png')",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <iframe
            src="https://player.vimeo.com/video/98800034"
            width="500"
            height="281"
            // frameBorder="0"
            allowFullScreen={true}
          ></iframe>
        </div>
        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
          Monitor Google. Copy the best SEOs. Hack the top spot.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-white mb-12 leading-relaxed max-w-3xl mx-auto">
          <span className="font-bold">Millions</span> of keywords included. All
          backlinks.
          <br />
          <span className="font-bold">For the first time</span>, unmatched
          firepower, in your hands.
        </p>
        {/* Call-to-Action Button */}
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          onClick={() => router.push("/sign-in")}
        >
          <Check className="w-5 h-5 mr-2" />
          Start immediately
        </Button>
      </div>
    </section>
  );
}
