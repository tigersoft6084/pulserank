"use client";

import { Card, CardContent } from "@/components/ui/card";

export function MethodsSection() {
  const methods = [
    {
      image: "/images/new_incoming.jpg",
      title: "Repérez",
      description:
        "Identify sites that are ranking dangerously high on certain keywords. And those who disappear.",
      explanation:
        "Instantly access our exclusive database to uncover your competitors' secrets. SEObserver analyzes the ranking of the top 100 sites across millions of keywords live.",
    },
    {
      image: "/images/rank_analysis.jpg",
      title: "Analyze",
      description:
        "the strategy using automatic filters and, if necessary, through our teams.",
      explanation:
        "Every single change is tracked and analyzed for any site across all queries. Does a backlink appear? Does a title change? Does a page volume change? You're kept up to date with everything, live.",
    },
    {
      image: "/images/new_incoming.jpg",
      title: "Plunder",
      description:
        "good ideas and techniques that work. Outperform your competitors at their own game.",
      explanation:
        "Build your own lists of high-value resources. SEObserver gives you access to a never-before-explored treasure trove, and you can access it immediately.",
    },
  ];

  return (
    <section className="py-10 bg-white" id="presentation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl  text-gray-900 mb-6">
            Find out immediately the methods{" "}
            <span className="font-bold">of the sites that rank</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Go beyond theoretical SEO. From now on, centralize all possible
            information and base your analyses on measurable, quantifiable, and
            above all… real data.
          </p>
        </div>

        {/* Methods Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {methods.map((method, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                {/* Image at top */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4 rounded-lg shadow-md bg-gray-50 p-4 inline-block">
                    <img src={method.image} alt={method.title} />
                  </div>
                </div>

                {/* Title with bold span */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    <span className="font-bold">{method.title}</span>{" "}
                    {method.description}
                  </h3>
                </div>

                {/* Additional explanation */}
                <p className="text-gray-600 leading-relaxed text-center">
                  {method.explanation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
