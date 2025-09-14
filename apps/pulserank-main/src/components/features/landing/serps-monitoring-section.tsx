"use client";

import { Check, Search } from "lucide-react";
import { useState } from "react";
import ImageCarouselDialog from "./Dialog/image-carousel-dialog";
import { Button } from "@/components/ui/button";

export function SerpsMonitoringSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const features = [
    {
      title: "Go back in time in the SERPs",
      description:
        "Gain complete and unlimited access to the history of the top 100 positions across millions of keywords. Become an expert even on queries you don't track, by going back in time.",
    },
    {
      title: "Add your keywords",
      description:
        "If we don't already monitor keywords that are important to you, add them to our watchlist to trigger SERP and top 100 site monitoring.",
    },
    {
      title: "Target surgically",
      description:
        "Do your keyword research by targeting them by CPC, search volume and interest, depending on your strategy.",
    },
    {
      title: "Really analyze the SEO competition",
      description:
        "Our original SERP visualization method (SERPmachine) shows you the reality of SEO competition on your keywords.",
    },
  ];

  return (
    <section className="py-10 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl  text-gray-900 mb-6">
            Keep an eye{" "}
            <span className="font-bold">
              on everything that's happening in the most important SERPs
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            By accessing all the most important SEO data, our database gives you
            an instant visibility map for each site and each keyword.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <div className="w-full h-full relative group">
            <div className="w-full h-full">
              <img
                src="/images/carousel/mutuelle-sante.png"
                className="w-full h-full rounded-lg "
                alt="SERPs Monitoring"
              />
            </div>
            {/* Hover overlay with search button */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </div>

          {/* Right Column - Features */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">
              Access the first SEO control tower
            </h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Carousel Dialog */}
      <ImageCarouselDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />
    </section>
  );
}
