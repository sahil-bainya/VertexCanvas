import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  TechStack,
  OpenSource,
  HowItWorks,
  Footer,
  FinalCTA,
  Features,
  DemoPreview,
  DotGrid,
  Hero,
  Navbar,
  AIShowcase,
  ComparisonTable,
} from "../components/LandingPage";
export default function LandingPage() {
const { status } = useSelector((state) => state.auth);
  if (status) return <Navigate to="/dashboard" replace />;
  return (
    <div className="relative min-h-screen bg-base-100 font-sans text-base-content">
      <DotGrid className="opacity-40" />
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
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
