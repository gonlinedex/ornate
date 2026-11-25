import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BUSINESS_INFO, NAV_LINKS } from '../data/ornateCatalog';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${
        scrolled || mobileOpen
          ? 'bg-[#101419]/96 border-b border-[#D6DCE2]/12'
          : 'bg-[#101419]/84 border-b border-[#D6DCE2]/8'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-[1.45rem] sm:text-[1.6rem] font-medium tracking-[0.02em] text-[#E6ECF2] hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          {BUSINESS_INFO.brandName}
        </a>

        {/* Zone 2: 5 concise single-line text links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7 text-[0.875rem] font-normal text-[#A5B0BC]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-1 hover:text-[#E6ECF2] transition-colors duration-200 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-[#D6DCE2]/75 hover:after:w-full after:transition-all after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#enquiry"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-[0.8125rem] font-medium tracking-[0.02em] text-[#101419] bg-[#D6DCE2] hover:bg-[#E8EEF4] transition-colors duration-200 whitespace-nowrap shrink-0"
          >
            Book Consultation
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 text-[#D6DCE2] border border-[#D6DCE2]/15 bg-[#191F25] hover:border-[#D6DCE2]/35 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="lg:hidden bg-[#101419] border-t border-[#D6DCE2]/12 px-5 py-6"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-base text-[#D6DCE2] hover:text-white border-b border-[#D6DCE2]/8 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <a
              href="#enquiry"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center py-3 px-5 text-sm font-medium text-[#101419] bg-[#D6DCE2] hover:bg-[#E8EEF4] transition-colors"
            >
              Book Consultation
            </a>
            <a
              href={BUSINESS_INFO.phoneHref}
              className="w-full inline-flex items-center justify-center py-3 px-5 text-sm text-[#A5B0BC] border border-[#D6DCE2]/15 hover:text-[#D6DCE2] transition-colors tabular-nums"
            >
              Call {BUSINESS_INFO.phoneDisplay}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
