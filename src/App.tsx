import { Navbar } from './components/Navbar';
import { HeroGateScene } from './components/HeroGateScene';
import { CollectionsSection } from './components/CollectionsSection';
import { CraftsmanshipSection } from './components/CraftsmanshipSection';
import { EnquirySection } from './components/EnquirySection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#101419] text-[#D6DCE2]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#D6DCE2] focus:text-[#101419] focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <HeroGateScene />
        <CollectionsSection />
        <CraftsmanshipSection />
        <EnquirySection />
      </main>

      <Footer />
    </div>
  );
}
