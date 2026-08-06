import { UserProfile, UserRole } from '../types';

/**
 * Single source of truth for what a user can actually do on the platform.
 *
 * Before this file existed, every gated view (Registry, Validation, API,
 * Governance, Lounge, project submission, usage limits...) re-implemented
 * its own `role === ADMIN || user.isPro` check. Since `isPro` was set to
 * `true` for BOTH the Patron (support/discover) and Professional
 * (certify/audit) roles, every paid tier ended up with identical access —
 * a €9/mo Patron had the exact same rights as a €299/mo Professional or a
 * €15,000/mo Enterprise account. See LYA_Audit_Services_Pricing.md.
 *
 * Discovery & patronage (browsing, following, comparing, and pledging
 * support to certified projects) are free and unlimited for EVERY visitor,
 * signed in or not — matching how Kickstarter, Indiegogo and Patreon all
 * work: the platform never charges the person giving money, only takes a
 * cut (see the 5% patronage commission) when a pledge actually happens.
 * There is deliberately no "Patron" paywall anymore.
 *
 * Paid tiers exist only for people who need certification tooling:
 *   - CREATOR:      submits their own work for certification (capped free,
 *                    extendable per-unit at €5/extra certification).
 *   - PROFESSIONAL: certification tooling for sourcing/auditing others'
 *                    work, split into two sub-tiers (see proTier):
 *                      STARTER  — Registry access, unlimited own-catalogue
 *                                 submissions, priority review queue.
 *                      ADVANCED — everything Starter has, plus API access,
 *                                 white-label reporting, dedicated account
 *                                 manager.
 *   - Lounge & Governance are gated by `isVerifiedValidator` (a manual
 *     vetting step — the existing "Become a Validator" flow), not by
 *     subscription tier alone. Enterprise/Admin get it automatically as
 *     part of the vetted institutional relationship.
 */

export const FREE_CREATOR_PROJECT_LIMIT = 3;
export const EXTRA_CERTIFICATION_PRICE_EUR = 5;
export const PRO_STARTER_PRICE_EUR = 79;
export const PRO_ADVANCED_PRICE_EUR = 249;

export interface Permissions {
  /** Any paid tier (Professional at any sub-tier, or Enterprise) or Admin.
   *  Kept for places that only need a coarse "is this a paying account"
   *  check (e.g. UI badges) — NOT for feature gating. */
  isPaidTier: boolean;

  canSubmitProjects: boolean;
  /** null = unlimited */
  projectSubmissionLimit: number | null;

  canAccessRegistryCertificationTools: boolean; // Registry review, Validation/Admin services
  canAccessAPI: boolean; // Pro Advanced, Enterprise, Admin only
  canAccessGovernance: boolean;
  canAccessLounge: boolean;

  // Discovery/patronage tooling is unlimited for everyone — kept as fields
  // (rather than deleted outright) so call sites don't need to change,
  // but every value here is always `null` (unlimited) by design.
  swipeLimit: number | null;
  compareLimit: number | null;
  simulatorLimit: number | null;
  scanLimit: number | null;
  talentLimit: number | null;
}

const UNLIMITED = null;

// Discovery is free and unlimited for absolutely everyone — signed out
// visitors included. No tier, paid or not, changes these.
const OPEN_DISCOVERY = {
  swipeLimit: UNLIMITED,
  compareLimit: UNLIMITED,
  simulatorLimit: UNLIMITED,
  scanLimit: UNLIMITED,
  talentLimit: UNLIMITED,
} as const;

export function getPermissions(user: UserProfile | null | undefined): Permissions {
  if (!user) {
    return {
      isPaidTier: false,
      canSubmitProjects: false,
      projectSubmissionLimit: 0,
      canAccessRegistryCertificationTools: false,
      canAccessAPI: false,
      canAccessGovernance: false,
      canAccessLounge: false,
      ...OPEN_DISCOVERY,
    };
  }

  if (user.role === UserRole.ADMIN) {
    return {
      isPaidTier: true,
      canSubmitProjects: true,
      projectSubmissionLimit: UNLIMITED,
      canAccessRegistryCertificationTools: true,
      canAccessAPI: true,
      canAccessGovernance: true,
      canAccessLounge: true,
      ...OPEN_DISCOVERY,
    };
  }

  const isProfessional = user.role === UserRole.PROFESSIONAL;
  const isEnterprise = !!user.isEnterprise; // institutional/catalog-scale accounts
  const isAdvanced = user.proTier === 'ADVANCED';

  if (isProfessional) {
    return {
      isPaidTier: true,
      canSubmitProjects: true,
      projectSubmissionLimit: UNLIMITED,
      canAccessRegistryCertificationTools: true,
      canAccessAPI: isEnterprise || isAdvanced,
      canAccessGovernance: isEnterprise || !!user.isVerifiedValidator,
      canAccessLounge: isEnterprise || !!user.isVerifiedValidator,
      ...OPEN_DISCOVERY,
    };
  }

  // PATRON and CREATOR (and any other/unknown role): free tier. Patrons
  // support and follow projects — they don't submit creative work for
  // certification, that's a Creator action.
  const isPatron = user.role === UserRole.PATRON;
  const extra = user.extraCertifications || 0;
  return {
    isPaidTier: false,
    canSubmitProjects: !isPatron,
    projectSubmissionLimit: isPatron ? 0 : FREE_CREATOR_PROJECT_LIMIT + extra,
    canAccessRegistryCertificationTools: false,
    canAccessAPI: false,
    canAccessGovernance: !!user.isVerifiedValidator,
    canAccessLounge: !!user.isVerifiedValidator,
    ...OPEN_DISCOVERY,
  };
}
