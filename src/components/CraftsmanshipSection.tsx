import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BUSINESS_INFO, CRAFT_STAGES } from '../data/ornateCatalog';

export const CraftsmanshipSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const [activeStage, setActiveStage] = useState(CRAFT_STAGES[0].id);
  const [imgError, setImgError] = useState(false);

  // Subtle native-scroll depth shift between foreground forged detail & background steel frame
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let rafId = 0;

    const updateParallax = () => {
      rafId = 0;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      // Progress from -1 (below viewport) to +1 (above viewport)
      const normalized = Math.max(-1, Math.min(1, (vh * 0.5 - (rect.top + rect.height * 0.5)) / vh));

      if (fgRef.current) {
        fgRef.current.style.transform = `translate3d(0, ${(normalized * -22).toFixed(1)}px, 0)`;
      }
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${(normalized * 16).toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const currentStage = CRAFT_STAGES.find((s) => s.id === activeStage) ?? CRAFT_STAGES[0];

  return (
    <section
      id="craftsmanship"
      aria-labelledby="craftsmanship-heading"
      className="relative py-20 sm:py-28 bg-[#13181E] border-y border-[#D6DCE2]/10 overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Macro Forged Ironwork Photography with Subtle Parallax Depth */}
          <div ref={containerRef} className="lg:col-span-5 relative min-h-[420px] sm:min-h-[540px] flex items-center">
            {/* Background architectural steel plate frame */}
            <div
              ref={bgRef}
              aria-hidden="true"
              className="absolute inset-y-6 left-0 right-8 sm:right-10 bg-[#191F25] border border-[#D6DCE2]/10 will-change-transform"
            >
              <div className="absolute inset-x-0 top-0 h-px platinum-hairline" />
              <div className="absolute inset-x-0 bottom-0 h-px platinum-hairline" />
            </div>

            {/* Foreground macro forged hinge & scrollwork photograph */}
            <div
              ref={fgRef}
              className="relative z-10 ml-5 sm:ml-8 w-full aspect-[3/4] max-h-[600px] overflow-hidden bg-[#101419] platinum-edge-border will-change-transform"
            >
              {!imgError ? (
                <img
                  src="/src/assets/images/craft_ironwork_detail_1795582234648.jpg"
                  alt="Macro photograph of hand-forged dark graphite wrought-iron scrollwork, welded steel collar, and heavy-duty barrel hinge"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 text-center bg-[#191F25]">
                  <span className="font-display text-2xl text-[#D6DCE2]">
                    Hand-Forged Scrollwork &amp; Heavy Barrel Hinges
                  </span>
                </div>
              )}

              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#101419]/92 via-[#101419]/45 to-transparent"
              />
              <div className="absolute left-5 right-5 bottom-4 z-10">
                <p className="text-[0.75rem] text-[#A5B0BC]">
                  Forged Detail · Woodbridge Fabrication Shop
                </p>
                <p className="text-[0.875rem] text-[#EDF2F7] mt-0.5">
                  Hand-formed scroll collar, welded structural stile &amp; barrel hinge
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Fabrication Narrative & Interactive 4-Stage Process */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <p className="text-[0.8125rem] text-[#A5B0BC] tracking-[0.04em] mb-3">
                Craftsmanship · No Templates, No Shortcuts
              </p>

              <h2
                id="craftsmanship-heading"
                className="font-display text-[clamp(2rem,3.3vw,3rem)] leading-[1.1] font-medium text-[#EDF2F7] mb-5"
              >
                Engineered for Ontario weather and balanced by hand.
              </h2>

              <p className="text-[0.975rem] leading-[1.7] text-[#A5B0BC] max-w-[60ch] mb-9">
                At {BUSINESS_INFO.legalName}, fiber-laser precision meets traditional smithing under
                one Woodbridge roof. Whether a project calls for classical arched scrollwork or
                clean architectural steel bars, every gate, railing, and screen is fabricated to
                exact site measurements and installed by our own crew.
              </p>

              {/* Interactive Fabrication Stage List */}
              <div
                role="tablist"
                aria-label="Fabrication process stages"
                className="border-t border-[#D6DCE2]/12 divide-y divide-[#D6DCE2]/10"
              >
                {CRAFT_STAGES.map((stage) => {
                  const isActive = stage.id === activeStage;
                  return (
                    <div key={stage.id} className="py-4">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`stage-panel-${stage.id}`}
                        id={`stage-tab-${stage.id}`}
                        onClick={() => setActiveStage(stage.id)}
                        className="w-full text-left flex items-baseline justify-between gap-4 py-1 group"
                      >
                        <span className="flex items-baseline gap-4">
                          <span
                            className={`text-[0.8125rem] tabular-nums transition-colors ${
                              isActive ? 'text-[#EDF2F7]' : 'text-[#7B8794] group-hover:text-[#A5B0BC]'
                            }`}
                          >
                            {stage.index}.
                          </span>
                          <span
                            className={`font-display text-[1.4rem] sm:text-[1.55rem] leading-tight transition-colors ${
                              isActive ? 'text-[#EDF2F7]' : 'text-[#A5B0BC] group-hover:text-[#D6DCE2]'
                            }`}
                          >
                            {stage.title}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`text-xs transition-colors whitespace-nowrap ${
                            isActive ? 'text-[#D6DCE2]' : 'text-[#7B8794]'
                          }`}
                        >
                          {isActive ? 'Active' : 'View'}
                        </span>
                      </button>

                      {isActive && (
                        <div
                          id={`stage-panel-${stage.id}`}
                          role="tabpanel"
                          aria-labelledby={`stage-tab-${stage.id}`}
                          className="pl-8 sm:pl-9 pt-3 pr-2"
                        >
                          <p className="text-[0.9375rem] leading-[1.65] text-[#C4CED8] max-w-[56ch]">
                            {currentStage.summary}
                          </p>
                          <p className="mt-2.5 text-[0.8125rem] text-[#A5B0BC]">
                            {currentStage.specification}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Proof & Completed Projects Link */}
            <div className="mt-8 pt-6 border-t border-[#D6DCE2]/12 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-[#A5B0BC] tabular-nums">
                <span className="text-[#D6DCE2]">{BUSINESS_INFO.verifiedProof.clients}</span>
                <span aria-hidden="true" className="text-[#D6DCE2]/30">
                  ·
                </span>
                <span>{BUSINESS_INFO.verifiedProof.rating}</span>
                <span aria-hidden="true" className="text-[#D6DCE2]/30">
                  ·
                </span>
                <span>{BUSINESS_INFO.verifiedProof.origin}</span>
              </div>

              <a
                href={BUSINESS_INFO.projectsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.875rem] text-[#D6DCE2] hover:text-white transition-colors whitespace-nowrap"
              >
                <span>View Completed Projects</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
