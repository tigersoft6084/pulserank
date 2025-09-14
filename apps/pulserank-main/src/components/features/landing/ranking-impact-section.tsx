"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageCarouselDialog from "./Dialog/image-carousel-dialog";

export function RankingImpactSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Define the images for this section
  const sectionImages = [
    {
      url: "/images/carousel/offsite.png",
      title: "Backlink strategy vs rankings",
      alt: "Backlink Analytics Dashboard",
    },
    {
      url: "/images/carousel/cms.jpg",
      title: "keyword selection",
      alt: "Sorted Backlink List",
    },
  ];

  const openCarousel = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsDialogOpen(true);
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl  text-gray-900 mb-6">
            Follow <span className="font-bold">all changes</span> that impact
            rankings
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understand concretely what impacts rankings: backlink creation,
            title changes, content changes, number of indexed pages and many
            other indicators. You are making rapid progress in SEO.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Backlink Analytics */}
          <div>
            <h3 className="text-2xl text-gray-900 mb-6">
              Compare rankings and new backlinks created
            </h3>

            {/* Image with hover effect */}
            <div className="mb-6 relative group">
              <img
                src={sectionImages[0].url}
                alt={sectionImages[0].alt}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              {/* Hover overlay with search button */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                <Button
                  onClick={() => openCarousel(1)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                  size="lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                </Button>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-gray-600 leading-relaxed">
              Check whether the new backlinks you obtained had an impact on your
              rankings. And if so, which ones and how long did they take?
            </p>
          </div>

          {/* Right Column - Backlink List */}
          <div>
            <h3 className="text-2xl  text-gray-900 mb-6">
              The complete list of all backlinks, already sorted
            </h3>

            {/* Image with hover effect */}
            <div className="mb-6 relative group">
              <img
                src={sectionImages[1].url}
                alt={sectionImages[1].alt}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              {/* Hover overlay with search button */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                <Button
                  onClick={() => openCarousel(2)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                  size="lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                </Button>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-gray-600 leading-relaxed">
              Includes access to all Majestic SEO data. No need to pay for a
              subscription to an additional backlink provider. We analyze the
              CMS and backlink type so you can find the information you need
              when you need it.
            </p>
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
