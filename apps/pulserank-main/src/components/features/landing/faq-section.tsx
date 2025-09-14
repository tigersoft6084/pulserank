"use client";

export function FaqSection() {
  const faqs = [
    {
      question: "Why choose SEOObserver?",
      answer:
        "SEOObserver is a unique solution on the market that allows you to centralize ranking monitoring and backlink analysis in one place for any site that ranks for the most interesting keywords on the French-speaking web. No other tool allows this.",
    },
    {
      question: "How does SEOObserver help improve my rankings?",
      answer:
        "SEOObserver provides comprehensive insights into SERP changes, competitor analysis, and backlink strategies. By understanding what works for your competitors and tracking your own performance in real-time, you can make data-driven decisions to improve your search rankings.",
    },
    {
      question: "What makes SEOObserver different from other SEO tools?",
      answer:
        "Unlike other tools that focus on limited aspects of SEO, SEOObserver offers a complete solution with access to millions of keywords, real-time SERP monitoring, comprehensive backlink analysis, and competitor intelligence all in one platform. Our unique approach provides insights that no other tool can match.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, all our plans come with no commitment. You can cancel your subscription at any time without any penalties or hidden fees. We believe in providing value that keeps you coming back, not locking you into long-term contracts.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
