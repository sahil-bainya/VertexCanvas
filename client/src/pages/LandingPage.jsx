
import {
  TechStack,
  OpenSource,
  HowItWorks,
  Footer,
   Features,
  DemoPreview,
  Hero,
  Navbar,
  AIShowcase,
  ComparisonTable,GradientBackground
} from "../components/LandingPage";
export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans text-zinc-900">
      <GradientBackground />
      <div className="relative">
        <Navbar />
        <Hero />
        <DemoPreview />
        <Features />
        <AIShowcase />
        <ComparisonTable />
        <HowItWorks />
        <TechStack />
        <OpenSource />
               <Footer />
      </div>
    </div>
  );
}