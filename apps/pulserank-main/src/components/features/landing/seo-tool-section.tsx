"use client";

export function SeoToolSection() {
  return (
    <section
      className="py-20 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/hero.png')" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left">
            <h2
              className="text-2xl md:text-3xl 
             text-white mb-6"
            >
              A tool made by SEOs, for SEOs.
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              SEObserver was conceived, designed and developed by SEO
              consultants, based on the needs of the SEO specialists and SEO
              agencies we met.
            </p>
          </div>

          {/* Right Column */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl  text-white mb-6">
              Who else but an SEO consultant can know the needs of an SEO?
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              This tool isn't a theoretical tool, divorced from reality. On the
              contrary, it was designed to meet the concrete, immediate, and
              tangible needs of real human beings working in the world of SEO.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
