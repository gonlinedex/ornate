import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Mail, MapPin, Paperclip, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../data/ornateCatalog';
import { EnquiryLatticeShadow } from './IronworkMotifs';

interface FormState {
  name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  category: 'Driveway Gate',
  city: 'Toronto',
  notes: '',
};

const PROJECT_CATEGORIES = [
  'Driveway Gate',
  'Pedestrian Gate',
  'Metal / Laser-Cut Railing',
  'Metal Fence / Privacy Screen',
  'Custom Metal Fabrication',
];

const SERVICE_CITIES = ['Toronto', 'Vaughan', 'Woodbridge', 'Greater Toronto Area'];

export const EnquirySection: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 10) {
      nextErrors.phone = 'Please enter a 10-digit phone number or leave blank.';
    }
    if (!form.notes.trim() || form.notes.trim().length < 10) {
      nextErrors.notes = 'Please share a brief description of your gate, railing, or fence project.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const buildMailtoHref = () => {
    const subject = encodeURIComponent(
      `Project Consultation — ${form.category} (${form.city})`
    );
    const body = encodeURIComponent(
      [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        form.phone ? `Phone: ${form.phone}` : null,
        `Project Category: ${form.category}`,
        `Location: ${form.city}`,
        attachmentName ? `Reference File Noted: ${attachmentName}` : null,
        '',
        'Project Details:',
        form.notes,
      ]
        .filter(Boolean)
        .join('\n')
    );
    return `${BUSINESS_INFO.emailHref}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="enquiry"
      aria-labelledby="enquiry-heading"
      className="relative py-20 sm:py-28 bg-[#101419] overflow-hidden"
    >
      {/* Faint Architectural Ironwork Lattice Shadow Backdrop */}
      <EnquiryLatticeShadow className="absolute inset-0 w-full h-full opacity-90" />

      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Verified Showroom, Direct Contact & GTA Service Areas */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-[0.8125rem] text-[#A5B0BC] tracking-[0.04em] mb-3">
                Woodbridge Showroom &amp; Consultations
              </p>
              <h2
                id="enquiry-heading"
                className="font-display text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.08] font-medium text-[#EDF2F7] mb-4"
              >
                Begin with a site consultation.
              </h2>
              <p className="text-[0.975rem] leading-[1.68] text-[#A5B0BC] max-w-[46ch]">
                Visit our Woodbridge showroom to inspect finishes and hardware in person, or send
                dimensions and reference photos for a tailored project estimate.
              </p>
            </div>

            {/* Verified Contact Pathways */}
            <div className="border-t border-[#D6DCE2]/12 divide-y divide-[#D6DCE2]/10">
              <div className="py-4 flex items-start gap-3.5">
                <Phone className="w-4 h-4 text-[#A5B0BC] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-[0.75rem] text-[#A5B0BC]">Speak With Our Team</p>
                  <a
                    href={BUSINESS_INFO.phoneHref}
                    className="text-[1.05rem] text-[#EDF2F7] hover:text-white transition-colors tabular-nums"
                  >
                    {BUSINESS_INFO.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3.5">
                <Mail className="w-4 h-4 text-[#A5B0BC] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-[0.75rem] text-[#A5B0BC]">Direct Email</p>
                  <a
                    href={BUSINESS_INFO.emailHref}
                    className="text-[1.05rem] text-[#EDF2F7] hover:text-white transition-colors break-all"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3.5">
                <MapPin className="w-4 h-4 text-[#A5B0BC] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-[0.75rem] text-[#A5B0BC]">Showroom &amp; Workshop</p>
                  <p className="text-[0.975rem] text-[#EDF2F7]">{BUSINESS_INFO.addressLine}</p>
                  <p className="mt-1.5 text-[0.8125rem] text-[#A5B0BC] tabular-nums">
                    {BUSINESS_INFO.hoursWeekday}
                  </p>
                  <p className="text-[0.8125rem] text-[#A5B0BC]">
                    {BUSINESS_INFO.hoursWeekend}
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Service Area Links */}
            <div className="pt-2">
              <p className="text-[0.75rem] text-[#A5B0BC] mb-2.5">
                Primary Installation &amp; Fabrication Service Areas
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.875rem]">
                {BUSINESS_INFO.serviceAreas.map((area, idx) => (
                  <React.Fragment key={area.name}>
                    {idx > 0 && (
                      <span aria-hidden="true" className="text-[#D6DCE2]/25">
                        ·
                      </span>
                    )}
                    <a
                      href={area.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#D6DCE2] hover:text-white transition-colors"
                    >
                      <span>{area.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#A5B0BC]" />
                    </a>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Validated Request for Project Consultation Card */}
          <div className="lg:col-span-7 bg-[#191F25] platinum-edge-border p-6 sm:p-9">
            {submitted ? (
              <div className="py-6 space-y-5" role="status" aria-live="polite">
                <div className="flex items-center gap-3 text-[#EDF2F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#D6DCE2] shrink-0" aria-hidden="true" />
                  <h3 className="font-display text-[1.9rem] leading-tight font-medium">
                    Consultation summary prepared
                  </h3>
                </div>

                <p className="text-[0.95rem] leading-relaxed text-[#A5B0BC] max-w-[54ch]">
                  Your project details for <strong className="text-[#EDF2F7] font-medium">{form.category}</strong> in{' '}
                  <strong className="text-[#EDF2F7] font-medium">{form.city}</strong> are ready to send directly to
                  Ornate Ironworks &amp; Decor at {BUSINESS_INFO.email}.
                </p>

                <div className="p-4 bg-[#101419] border border-[#D6DCE2]/12 text-[0.8125rem] text-[#A5B0BC] space-y-1">
                  <p>
                    <span className="text-[#D6DCE2]">Client:</span> {form.name} ({form.email})
                  </p>
                  {form.phone && (
                    <p className="tabular-nums">
                      <span className="text-[#D6DCE2]">Phone:</span> {form.phone}
                    </p>
                  )}
                  {attachmentName && (
                    <p>
                      <span className="text-[#D6DCE2]">Reference file:</span> {attachmentName} (attach in email or live contact form)
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={buildMailtoHref()}
                    className="inline-flex items-center justify-center px-5 py-3 text-[0.875rem] font-medium text-[#101419] bg-[#D6DCE2] hover:bg-[#EDF2F7] transition-colors whitespace-nowrap"
                  >
                    Send via Email Client
                  </a>
                  <a
                    href={BUSINESS_INFO.contactPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-3 text-[0.875rem] text-[#D6DCE2] border border-[#D6DCE2]/22 hover:border-[#D6DCE2]/50 hover:text-white transition-colors whitespace-nowrap"
                  >
                    <span>Open Live Contact Page</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm(INITIAL_FORM);
                      setAttachmentName('');
                    }}
                    className="px-4 py-3 text-[0.875rem] text-[#A5B0BC] hover:text-[#EDF2F7] transition-colors whitespace-nowrap"
                  >
                    Edit Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="border-b border-[#D6DCE2]/10 pb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-[1.75rem] font-medium text-[#EDF2F7]">
                    Request for Project Consultation
                  </h3>
                  <a
                    href={BUSINESS_INFO.contactPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.8125rem] text-[#A5B0BC] hover:text-[#EDF2F7] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Direct site form</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="enquiry-name" className="block text-[0.8125rem] text-[#D6DCE2] mb-1.5">
                      Full Name <span className="text-[#A5B0BC]">*</span>
                    </label>
                    <input
                      id="enquiry-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, name: e.target.value }));
                        if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
                      }}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2.5 bg-[#101419] border border-[#D6DCE2]/16 text-[#EDF2F7] placeholder:text-[#7B8794] text-[0.9375rem] focus:border-[#D6DCE2]/60 focus:outline-none transition-colors"
                    />
                    {errors.name && (
                      <p role="alert" className="mt-1.5 text-[0.75rem] text-[#F1B4B4]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="enquiry-email" className="block text-[0.8125rem] text-[#D6DCE2] mb-1.5">
                      Email Address <span className="text-[#A5B0BC]">*</span>
                    </label>
                    <input
                      id="enquiry-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, email: e.target.value }));
                        if (errors.email) setErrors((err) => ({ ...err, email: undefined }));
                      }}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#101419] border border-[#D6DCE2]/16 text-[#EDF2F7] placeholder:text-[#7B8794] text-[0.9375rem] focus:border-[#D6DCE2]/60 focus:outline-none transition-colors"
                    />
                    {errors.email && (
                      <p role="alert" className="mt-1.5 text-[0.75rem] text-[#F1B4B4]">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="enquiry-phone" className="block text-[0.8125rem] text-[#D6DCE2] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="enquiry-phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, phone: e.target.value }));
                        if (errors.phone) setErrors((err) => ({ ...err, phone: undefined }));
                      }}
                      placeholder="(416) 555-0190"
                      className="w-full px-3.5 py-2.5 bg-[#101419] border border-[#D6DCE2]/16 text-[#EDF2F7] placeholder:text-[#7B8794] text-[0.9375rem] tabular-nums focus:border-[#D6DCE2]/60 focus:outline-none transition-colors"
                    />
                    {errors.phone && (
                      <p role="alert" className="mt-1.5 text-[0.75rem] text-[#F1B4B4]">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="enquiry-category" className="block text-[0.8125rem] text-[#D6DCE2] mb-1.5">
                      Project Type
                    </label>
                    <select
                      id="enquiry-category"
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#101419] border border-[#D6DCE2]/16 text-[#EDF2F7] text-[0.9375rem] focus:border-[#D6DCE2]/60 focus:outline-none transition-colors"
                    >
                      {PROJECT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#191F25] text-[#EDF2F7]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="enquiry-city" className="block text-[0.8125rem] text-[#D6DCE2] mb-1.5">
                      Location
                    </label>
                    <select
                      id="enquiry-city"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#101419] border border-[#D6DCE2]/16 text-[#EDF2F7] text-[0.9375rem] focus:border-[#D6DCE2]/60 focus:outline-none transition-colors"
                    >
                      {SERVICE_CITIES.map((city) => (
                        <option key={city} value={city} className="bg-[#191F25] text-[#EDF2F7]">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="enquiry-notes" className="block text-[0.8125rem] text-[#D6DCE2] mb-1.5">
                    Approximate Dimensions &amp; Project Notes <span className="text-[#A5B0BC]">*</span>
                  </label>
                  <textarea
                    id="enquiry-notes"
                    rows={4}
                    required
                    value={form.notes}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, notes: e.target.value }));
                      if (errors.notes) setErrors((err) => ({ ...err, notes: undefined }));
                    }}
                    placeholder="Share opening width, style preference (scrollwork, horizontal steel, laser-cut), or desired timeline..."
                    className="w-full px-3.5 py-2.5 bg-[#101419] border border-[#D6DCE2]/16 text-[#EDF2F7] placeholder:text-[#7B8794] text-[0.9375rem] leading-relaxed focus:border-[#D6DCE2]/60 focus:outline-none transition-colors resize-y"
                  />
                  {errors.notes && (
                    <p role="alert" className="mt-1.5 text-[0.75rem] text-[#F1B4B4]">
                      {errors.notes}
                    </p>
                  )}
                </div>

                {/* Reference File Upload (Matches live site consultation capability) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 text-[0.8125rem] text-[#A5B0BC] hover:text-[#EDF2F7] cursor-pointer transition-colors">
                    <Paperclip className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate max-w-[260px]">
                      {attachmentName ? `Attached: ${attachmentName}` : 'Attach site photo or reference drawing'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf,.dwg"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setAttachmentName(file ? file.name : '');
                      }}
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-3 text-[0.875rem] font-medium tracking-[0.02em] text-[#101419] bg-[#D6DCE2] hover:bg-[#EDF2F7] transition-colors duration-200 whitespace-nowrap shrink-0"
                  >
                    Prepare Consultation Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
