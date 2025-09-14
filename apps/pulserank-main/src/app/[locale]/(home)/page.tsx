import { PublicNavigation } from "@/components/layout/public-navigation";
import { HeroSection } from "@/components/features/landing/hero-section";
import { SeoToolSection } from "@/components/features/landing/seo-tool-section";
import { MethodsSection } from "@/components/features/landing/methods-section";
import { SerpsMonitoringSection } from "@/components/features/landing/serps-monitoring-section";
import { RankingImpactSection } from "@/components/features/landing/ranking-impact-section";
import { WhyChooseSection } from "@/components/features/landing/why-choose-section";
import { FaqSection } from "@/components/features/landing/faq-section";
import { ContactSection } from "@/components/features/landing/contact-section";
import { PlanSection } from "@/components/features/subscription/plan-section";
import { FooterSection } from "@/components/features/landing/footer-section";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PublicNavigation />
      <div className="h-[3px] bg-yellow-600"></div>
      <HeroSection />
      <div className="h-[1px] bg-yellow-600"></div>

      <MethodsSection />
      <div className="h-[1px] bg-yellow-600"></div>
      <SerpsMonitoringSection />
      <div className="h-[1px] bg-yellow-600"></div>
      <RankingImpactSection />
      <div className="h-[1px] bg-yellow-600"></div>
      <WhyChooseSection />
      <div className="h-[1px] bg-yellow-600"></div>
      <PlanSection isLandingPage={true} className="py-20" />
      <div className="h-[1px] bg-yellow-600"></div>
      <FaqSection />
      <div className="h-[1px] bg-yellow-600"></div>
      <ContactSection />
      <div className="h-[1px] bg-yellow-600"></div>
      <SeoToolSection />

      <FooterSection />
    </div>
  );
}
