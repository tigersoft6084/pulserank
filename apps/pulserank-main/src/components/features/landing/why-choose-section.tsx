"use client";

import { useState } from "react";
import { Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageCarouselDialog from "./Dialog/image-carousel-dialog";

export function WhyChooseSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const comparisons = [
    {
      title: "Rankings",
      image: "/images/carousel/mutuelle-sante.png",
      carouselIndex: 0, // Index in the carousel for this image
      before: {
        title: "Before SEOObserver",
        description:
          "You had to manually check your website's rankings, or you had to pay for a certain number of tracked keywords or a dubious proxy pack. You had to wait 24 hours between readings.",
      },
      after: {
        title: "With SEOObserver",
        description:
          "You have a comprehensive view of how the SERPs have changed over time, both for you and your competitors. You pay for full access to a database of millions of keywords. You can refresh our results if you see that the SERP has changed.",
      },
      isHoverable: true,
    },
    {
      title: "Backlink Monitoring",
      image: "/images/carousel/last_backlinks.jpg",
      carouselIndex: 4, // Index in the carousel for this image
      before: {
        title: "Before SEOObserver",
        description:
          "You would spot a website that passed you by and analyze its backlinks manually every 3/4 days, using csv exports and complicated and boring Excel sorting.",
      },
      after: {
        title: "With SEOObserver",
        description:
          "The software automatically identifies sites of interest, tracks them automatically, and highlights their strategies. You can download an export if necessary.",
      },
      isHoverable: true,
    },
    {
      title: "Manual Review of the backlink",
      image: "/images/carousel/extension.jpg",
      carouselIndex: 5, // Index in the carousel for this image
      before: {
        title: "Before SEOObserver",
        description:
          "When performing a link review, you were forced to visually search for the link by doing long, boring scrolls and sometimes without reaching your goal.",
      },
      after: {
        title: "With SEOObserver",
        description:
          'You click on the "SEObserver" bookmarklet and your screen scrolls to the link, then circles it in red on a fluorescent yellow background. It\'s impossible to miss.',
      },
      isHoverable: true,
    },
    {
      title: "Choosing keywords",
      image: "/images/carousel/tapez.jpg",
      carouselIndex: 6, // Index in the carousel for this image
      before: {
        title: "Before SEOObserver",
        description:
          "You did your research manually. Or you had to pay for access to various software programs that were supposed to show you the relevance of keywords.",
      },
      after: {
        title: "With SEOObserver",
        description:
          "You have an overview of the entire French-speaking AdWords keyword database. Our method for ranking the most important keywords gives you a quick overview of the essential keywords in the French-speaking market.",
      },
      isHoverable: true,
    },
    {
      title: "Subscription prices",
      image: "/images/carousel/euros.png",
      carouselIndex: 4, // Index in the carousel for this image
      before: {
        title: "Before SEOObserver",
        description:
          "You had to pay for multiple subscriptions to different data providers and juggle between different tools in a boring way.",
      },
      after: {
        title: "With SEOObserver",
        description:
          "You have an all-in-one tool that combines the best of every tool currently on the market.",
      },
      isHoverable: false,
    },
  ];

  const openCarousel = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsDialogOpen(true);
  };

  return (
    <section className="py-20 bg-gray-50" id="benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl  text-gray-900 mb-6">
            Discover how SEOobserver will radically transform your habits and{" "}
            <span className="font-bold">save you several hours per day</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the dramatic difference between traditional SEO approaches and
            our revolutionary platform. Transform your workflow and achieve
            results faster than ever before.
          </p>
        </div>

        {/* Comparison Blocks */}
        <div className="space-y-16">
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className="grid lg:grid-cols-12 gap-12 items-center"
            >
              {/* Left Column - Image with hover effect (4/12) */}
              <div className="order-1 lg:order-1 lg:col-span-4 w-full h-full relative group">
                <img
                  src={comparison.image}
                  alt={`${comparison.title} Dashboard`}
                  className="w-full h-full rounded-lg shadow-lg"
                />
                {/* Hover overlay with search button */}
                {comparison.isHoverable && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => openCarousel(comparison.carouselIndex)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                      size="lg"
                    >
                      <Search className="w-5 h-5 mr-2" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column - Content (8/12) */}
              <div className="order-1 lg:order-2 lg:col-span-8">
                <h3 className="text-2xl text-gray-900 mb-4">
                  {comparison.title}
                </h3>

                <div className="space-y-3">
                  {/* Before SEOObserver */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <X className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          {comparison.before.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {comparison.before.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* With SEOObserver */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          {comparison.after.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {comparison.after.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
