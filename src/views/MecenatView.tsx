import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CONTRACTS } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  MECENAT_THEMES,
  WhatIsLyaScore,
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
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<"score_desc" | "score_asc" | "name_asc" | "recent">("score_desc");

  useEffect(() => { setVisibleCount(12); }, [activeTheme, searchQuery, categoryFilter, minScore, sortBy]);

  // Toutes les catégories réelles présentes dans les projets certifiés
  // en direct — pour le filtre "Catégorie précise", plus fin que les
  // thèmes regroupés ci-dessus.
  const allCategories = useMemo(() => {
    const cats = new Set(CONTRACTS.filter(c => c.status === "LIVE").map(c => c.category));
    return Array.from(cats).sort();
  }, []);

  // Utilise tous les contrats LIVE de types.ts
  const filteredContracts = useMemo(() => {
    const theme = MECENAT_THEMES.find(t => t.id === activeTheme);
    let base = CONTRACTS.filter(c => c.status === "LIVE");
    if (theme && theme.cats.length > 0) base = base.filter(c => theme.cats.includes(c.category));
    if (categoryFilter !== "all") base = base.filter(c => c.category === categoryFilter);
    if (minScore > 0) base = base.filter(c => c.totalScore >= minScore);
    const q = searchQuery.trim().toLowerCase();
    if (q) base = base.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.issuerId?.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
    const sorted = [...base];
    if (sortBy === "score_desc") sorted.sort((a, b) => b.totalScore - a.totalScore);
    else if (sortBy === "score_asc") sorted.sort((a, b) => a.totalScore - b.totalScore);
    else if (sortBy === "name_asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [activeTheme, categoryFilter, minScore, searchQuery, sortBy]);

  return (
    <section className="bg-surface-dim min-h-screen">
      {/* ── Header ── */}
      <div className="py-8">

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
                    <>DÉCOUVREZ, SUIVEZ,<br />SOUTENEZ<br /><span className="text-primary-cyan">LES CRÉATEURS CERTIFIÉS</span></>,
                    <>DISCOVER, FOLLOW,<br />SUPPORT<br /><span className="text-primary-cyan">LYA-CERTIFIED CREATORS</span></>
                  )}
                </h1>
                <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed opacity-80">
                  {T(
                    "Bienvenue dans notre espace de découverte simplifié. Ici, pas de graphiques financiers ou de carnets d'ordres rebutants. Juste de l'art sublime, du talent brut, et un moyen simple et interactif de soutenir vos créations favorites et de suivre leur certification.",
                    "Welcome to our simplified discovery space. No financial charts or intimidating order books. Just sublime art, raw talent, and a simple interactive way to support your favourite creations and follow their certification."
                  )}
                </p>
              </div>
              <div className="shrink-0 w-[180px]">
                <div className="relative rounded-2xl p-px" style={{ background: 'linear-gradient(145deg, rgba(0,212,232,0.35) 0%, rgba(255,255,255,0.06) 60%)' }}>
                  <div className="bg-surface-low/80 rounded-2xl p-5 text-center space-y-3">
                    <p className="text-xs font-mono tracking-[0.22em] uppercase" style={{ color: 'rgba(0,212,232,0.6)' }}>
                      {T('SCORE LYA', 'LYA SCORE')}
                    </p>
                    <p className="font-mono font-black text-2xl text-primary-cyan tracking-tight">
                      0-1000
                    </p>
                    <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,232,0.3), transparent)' }} />
                    <p className="text-xs font-mono text-on-surface-variant/50 leading-relaxed">
                      {T('Standard de certification créative', 'Creative certification standard')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LYA Score definition */}
        <WhatIsLyaScore lang={lang} />

        {/* Recherche & filtres */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T("Rechercher un projet, un créateur...", "Search a project, a creator...") as string}
                className="w-full bg-surface-low/60 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-cyan/50 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface">
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all shrink-0 ${showFilters || categoryFilter !== "all" || minScore > 0 || sortBy !== "score_desc" ? "bg-primary-cyan text-surface-dim border-primary-cyan" : "border-white/10 text-on-surface-variant hover:border-primary-cyan/40"}`}
            >
              <SlidersHorizontal size={15} />
              {T("Filtres", "Filters")}
            </button>
          </div>

          {showFilters && (
            <div className="bg-surface-low/40 border border-white/10 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest block mb-2">{T("Catégorie précise", "Exact category")}</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-surface-high/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary-cyan/50"
                >
                  <option value="all">{T("Toutes", "All")}</option>
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest block mb-2">
                  {T("Score LYA minimum", "Minimum LYA Score")} — {minScore}/1000
                </label>
                <input
                  type="range" min={0} max={950} step={50}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-primary-cyan"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest block mb-2">{T("Trier par", "Sort by")}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-surface-high/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary-cyan/50"
                >
                  <option value="score_desc">{T("Score LYA — décroissant", "LYA Score — highest first")}</option>
                  <option value="score_asc">{T("Score LYA — croissant", "LYA Score — lowest first")}</option>
                  <option value="name_asc">{T("Nom — A à Z", "Name — A to Z")}</option>
                </select>
              </div>
              {(categoryFilter !== "all" || minScore > 0 || sortBy !== "score_desc") && (
                <button
                  onClick={() => { setCategoryFilter("all"); setMinScore(0); setSortBy("score_desc"); }}
                  className="sm:col-span-3 text-xs font-bold text-on-surface-variant hover:text-primary-cyan transition-colors text-left"
                >
                  {T("↺ Réinitialiser les filtres", "↺ Reset filters")}
                </button>
              )}
            </div>
          )}
        </div>

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
      <div className="pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-on-surface-variant/60 text-[10px] font-mono tracking-widest">
            {T("PROJETS CRÉATIFS", "CREATIVE PROJECTS")} — <span className="text-primary-cyan">{filteredContracts.length} {T("ŒUVRES", "WORKS")}</span>
          </span>
        </div>

        {filteredContracts.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-mono text-sm">
            {T("Aucun projet ne correspond à votre recherche.", "No project matches your search.")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContracts.slice(0, visibleCount).map(contract => (
                <ProjectCard
                  key={contract.id}
                  contract={contract}
                  lang={lang}
                  onViewProject={(c, u) => { setShowPayment(false); setDetail({ contract: c, units: u }); }}
                  onSupport={(c, u) => { setShowPayment(true); setDetail({ contract: c, units: u }); }}
                />
              ))}
            </div>
            {visibleCount < filteredContracts.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount(n => n + 12)}
                  className="px-6 py-3 bg-surface-high/40 border border-white/10 rounded-xl text-sm font-black text-on-surface-variant hover:text-on-surface hover:border-primary-cyan/40 transition-all"
                >
                  {T('Voir plus', 'Load more')} ({filteredContracts.length - visibleCount} {T('restants', 'remaining')})
                </button>
              </div>
            )}
          </>
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





