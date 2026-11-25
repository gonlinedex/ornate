import React from 'react';
import { BUSINESS_INFO } from '../data/ornateCatalog';

const FOOTER_PRODUCT_LINKS = [
  { label: 'Driveway Gates', href: 'https://ornateirondecor.com/driveway-gates/' },
  { label: 'Pedestrian Gates', href: 'https://ornateirondecor.com/pedestrian-gates/' },
  { label: 'Metal Railings', href: 'https://ornateirondecor.com/metal-railing/' },
  { label: 'Laser-Cut Railings', href: 'https://ornateirondecor.com/laser-cut-railing/' },
  { label: 'Metal Fences', href: 'https://ornateirondecor.com/metal-fence/' },
  { label: 'Privacy Screens', href: 'https://ornateirondecor.com/privacy-screen/' },
];

const FOOTER_COMPANY_LINKS = [
  { label: 'Our Projects', href: BUSINESS_INFO.projectsUrl },
  { label: 'Gallery', href: BUSINESS_INFO.galleryUrl },
  { label: 'Gate & Fence Installation', href: BUSINESS_INFO.installationUrl },
  { label: 'Contact Us', href: BUSINESS_INFO.contactPageUrl },
  { label: 'Privacy Policy', href: 'https://ornateirondecor.com/privacy-policy-2/' },
  { label: 'Terms & Conditions', href: 'https://ornateirondecor.com/terms-and-conditions/' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0C0F13] border-t border-[#D6DCE2]/10 text-[#A5B0BC]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#D6DCE2]/10">
          {/* Brand & Address */}
          <div className="md:col-span-5 space-y-3">
            <a
              href="#top"
              className="font-display text-[1.6rem] font-medium text-[#EDF2F7] inline-block"
            >
              {BUSINESS_INFO.legalName}
            </a>
            <p className="text-[0.875rem] leading-relaxed max-w-[40ch]">
              Custom wrought-iron gates, architectural railings, fencing, and fiber-laser metalwork
              serving Toronto, Vaughan, Woodbridge, and the GTA.
            </p>
            <div className="pt-2 space-y-1 text-[0.8125rem] tabular-nums">
              <p className="text-[#D6DCE2]">{BUSINESS_INFO.addressLine}</p>
              <p>
                <a href={BUSINESS_INFO.phoneHref} className="hover:text-[#EDF2F7] transition-colors">
                  {BUSINESS_INFO.phoneDisplay}
                </a>
                <span aria-hidden="true" className="mx-2 text-[#D6DCE2]/25">
                  ·
                </span>
                <a href={BUSINESS_INFO.emailHref} className="hover:text-[#EDF2F7] transition-colors">
                  {BUSINESS_INFO.email}
                </a>
              </p>
            </div>
          </div>

          {/* Product Range */}
          <div className="md:col-span-3">
            <h3 className="font-sans text-[0.8125rem] font-medium text-[#EDF2F7] mb-4">
              Product Range
            </h3>
            <ul className="space-y-2.5 text-[0.875rem]">
              {FOOTER_PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#EDF2F7] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio & Info */}
          <div className="md:col-span-4">
            <h3 className="font-sans text-[0.8125rem] font-medium text-[#EDF2F7] mb-4">
              Company &amp; Showroom
            </h3>
            <ul className="space-y-2.5 text-[0.875rem] mb-6">
              {FOOTER_COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#EDF2F7] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem]">
              {BUSINESS_INFO.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A5B0BC] hover:text-[#EDF2F7] transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[0.75rem] text-[#7B8794]">
          <p>
            © {new Date().getFullYear()} {BUSINESS_INFO.legalName}. All rights reserved.
          </p>
          <p>
            {BUSINESS_INFO.hoursWeekday} · {BUSINESS_INFO.hoursWeekend}
          </p>
        </div>
      </div>
    </footer>
  );
};
