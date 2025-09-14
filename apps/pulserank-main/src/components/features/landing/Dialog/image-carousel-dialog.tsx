"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export default function ImageCarouselDialog({
  isDialogOpen,
  setIsDialogOpen,
  currentImageIndex,
  setCurrentImageIndex,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}) {
  const carouselImages = [
    {
      url: "/images/carousel/mutuelle-sante.png",
      title: "SERP time machine",
    },
    {
      url: "/images/carousel/offsite.png",
      title: "Backlink strategy vs rankings",
    },
    {
      url: "/images/carousel/cms.jpg",
      title: "Ranking of backlinks",
    },
    {
      url: "/images/carousel/mutuelle-sante.png",
      title: "feature",
    },
    {
      url: "/images/carousel/last_backlinks.jpg",
      title: "The review of your competitors' new backlinks is facilitated",
    },
    {
      url: "/images/carousel/extension.jpg",
      title: "Click on the chrome extension, the backlink is highlighted!",
    },
    {
      url: "/images/carousel/tapez.jpg",
      title: "keyword selection",
    },
  ];

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{carouselImages[currentImageIndex]["title"]}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="relative p-6">
          {/* Main Image */}
          <div className="relative">
            <img
              src={carouselImages[currentImageIndex]["url"]}
              alt={`SERP Monitoring ${currentImageIndex + 1}`}
              className="w-full h-auto rounded-lg"
            />

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={() =>
                setCurrentImageIndex(
                  currentImageIndex === 0
                    ? carouselImages.length - 1
                    : currentImageIndex - 1,
                )
              }
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={() =>
                setCurrentImageIndex(
                  currentImageIndex === carouselImages.length - 1
                    ? 0
                    : currentImageIndex + 1,
                )
              }
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Image Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex
                    ? "bg-primary"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className="text-center mt-2 text-sm text-gray-600">
            {currentImageIndex + 1} of {carouselImages.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
