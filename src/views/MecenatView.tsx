import { useState, useMemo } from "react";
import { CONTRACTS } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  MECENAT_THEMES,
  WhatIsLyaUnit,
  ProjectCard,
  DetailModal,
  PaymentModal,
} from "../components/mecenat/MecenatShared";
import type { Contract } from "../types";

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export function MecenatView() {
  const { language } = useTranslation();
  const lang: "FR" | "EN" = language === "FR" ? "FR" : "EN";
  const T = (fr: React.ReactNode, en: React.ReactNode) => lang === "FR" ? fr : en;

  const [activeTheme, setActiveTheme] = useState("all");
  const [detail, setDetail] = useState<{ contract: Contract; units: number } | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Utilise tous les contrats LIVE de types.ts
  const filteredContracts = useMemo(() => {
    const theme = MECENAT_THEMES.find(t => t.id === activeTheme);
    const base = CONTRACTS.filter(c => c.status === "LIVE");
    if (!theme || theme.cats.length === 0) return base;
    return base.filter(c => theme.cats.includes(c.category));
  }, [activeTheme]);

  return (
    <section className="bg-surface-dim min-h-screen">
      {/* ── Header ── */}
      <div className="px-6 py-10 max-w-7xl mx-auto">

        {/* Hero encadré */}
        <div className="relative bg-surface-low/60 border border-white/10 rounded-2xl p-6 md:p-10 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-start items-center">
              <span className="text-primary-cyan text-xs font-mono tracking-widest border border-primary-cyan/30 px-3 py-1 rounded-full">
                ✦ {T("ESPACE MÉCÉNAT LYA", "LYA PATRONAGE SPACE")}
              </span>
            </div>

            {/* Hero — 2 lignes, typo douce et premium (Outfit, identique à ART IS AN EXCHANGE) */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div>
                <h1 className="font-headline font-black text-on-surface mb-5 uppercase tracking-tighter leading-[0.88]" style={{
                  fontSize: "clamp(2.4rem,5.5vw,4.2rem)",
                }}>
                  {T(
                    <>CO-POSSÉDEZ LES<br />CHEFS-D&apos;ŒUVRE DE DEMAIN<br /><span className="text-primary-cyan">EN UN CLIC</span></>,
                    <>CO-OWN TOMORROW&apos;S<br />MASTERPIECES,<br /><span className="text-primary-cyan">IN A SINGLE CLICK</span></>
                  )}
                </h1>
                <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed opacity-80">
                  {T(
                    "Bienvenue dans notre espace de découverte simplifié. Ici, pas de graphiques financiers ou de carnets d'ordres rebutants. Juste de l'art sublime, du talent brut, et un moyen simple et interactif de soutenir vos créateurs favoris et de partager leurs futurs succès.",
                    "Welcome to our simplified discovery space. No financial charts or intimidating order books. Just sublime art, raw talent, and a simple interactive way to support your favourite creators and share in their future success."
                  )}
                </p>
              </div>
              <div className="relative shrink-0 min-w-[220px]">
                <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30" style={{ background: 'radial-gradient(ellipse at center, #f59e0b 0%, transparent 70%)' }} />
                <div className="relative rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #9D00FF 100%)' }}>
                  <div className="bg-surface-dim rounded-2xl p-6 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[9px] font-black tracking-[0.2em] uppercase" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.15), rgba(251,191,36,0.10))', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}>
                      ✦ {T('LA RÉVOLUTION LYA', 'THE LYA REVOLUTION')}
                    </div>
                    <p className="text-[10px] font-mono tracking-[0.25em] mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
                      {T('VALEUR UNIQUE AU MONDE', "WORLD'S UNIQUE VALUE")}
                    </p>
                    <p className="font-headline font-black tracking-tighter mb-1 leading-none" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      LYA UNIT
                    </p>
                    <p className="text-on-surface text-lg font-black font-headline tracking-tighter mb-4">
                      = <span className="text-primary-cyan">$50.00</span>
                    </p>
                    <p className="text-on-surface-variant/60 text-[10px] font-mono leading-relaxed mb-4">
                      {T(
                        "L'index de valeur créative souverain et exclusif qui propulse chaque projet LYA.",
                        "The sovereign and exclusive creative value index powering every LYA project."
                      )}
                    </p>
                    <div className="py-2 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.20), rgba(251,191,36,0.15))', border: '1px solid rgba(245,158,11,0.30)', color: '#fbbf24' }}>
                      ★ {T('INDEX CRÉATIF SOUVERAIN', 'SOVEREIGN CREATIVE INDEX')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LYA Unit définition */}
        <WhatIsLyaUnit lang={lang} />

        {/* Filtres thématiques */}
        <div className="mb-8">
          <p className="text-primary-cyan text-[10px] font-mono tracking-widest mb-4">
            ● {T("SÉLECTIONNEZ UN THÈME ARTISTIQUE", "CHOOSE AN ART MOOD")}
          </p>
          <div className="flex flex-wrap gap-3">
            {MECENAT_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono transition-all ${activeTheme === theme.id ? "bg-primary-cyan text-surface-dim font-bold" : "border border-white/10 text-on-surface-variant hover:border-primary-cyan/50 hover:text-on-surface"}`}
              >
                <span>{theme.icon}</span>
                {T(theme.labelFR, theme.labelEN)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grille projets ── */}
      <div className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-on-surface-variant/60 text-[10px] font-mono tracking-widest">
            {T("PROJETS CRÉATIFS", "CREATIVE PROJECTS")} — <span className="text-primary-cyan">{filteredContracts.length} {T("ŒUVRES", "WORKS")}</span>
          </span>
        </div>

        {filteredContracts.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-mono text-sm">
            {T("Aucun projet dans cette catégorie.", "No projects in this category.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContracts.map(contract => (
              <ProjectCard
                key={contract.id}
                contract={contract}
                lang={lang}
                onViewProject={(c, u) => { setShowPayment(false); setDetail({ contract: c, units: u }); }}
                onSupport={(c, u) => { setShowPayment(true); setDetail({ contract: c, units: u }); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {detail && !showPayment && (
        <DetailModal
          contract={detail.contract}
          units={detail.units}
          onUnitsChange={(u) => setDetail(d => d ? { ...d, units: u } : d)}
          onClose={() => setDetail(null)}
          onPay={() => setShowPayment(true)}
          lang={lang}
        />
      )}
      {detail && showPayment && (
        <PaymentModal
          contract={detail.contract}
          units={detail.units}
          onClose={() => { setShowPayment(false); setDetail(null); }}
          lang={lang}
        />
      )}
    </section>
  );
}

export { MecenatView as MecenatGrandPublic };
export default MecenatView;





