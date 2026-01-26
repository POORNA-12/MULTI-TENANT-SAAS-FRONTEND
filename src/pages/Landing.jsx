import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CoreModules from "../components/CoreModules";
import SecuritySection from "../components/SecuritySection";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import TenantXLogo from "../components/TenantXLogo";


export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <CoreModules />
      <SecuritySection />
      <CTA />
      <Footer />
      <TenantXLogo/>
    </>
  );
}
