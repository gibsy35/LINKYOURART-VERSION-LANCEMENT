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
 * This module fixes that by deriving permissions from what a role is
 * actually FOR, not from a single binary flag:
 *   - CREATOR:      submits their own work for certification (capped free,
 *                    extendable per-unit).
 *   - PATRON:       discovers & supports projects. Does NOT submit work.
 *   - PROFESSIONAL: everything a Patron has, PLUS certification tooling
 *                    (Registry review, Validation/Admin services, API) and
 *                    unlimited submission for their own catalogue.
 *   - Lounge & Governance are gated by `isVerifiedValidator` (a manual
 *     vetting step — the existing "Become a Validator" flow), not by
 *     subscription tier alone. Enterprise/Admin get it automatically as
 *     part of the vetted institutional relationship.
 */

export const FREE_CREATOR_PROJECT_LIMIT = 3;
export const EXTRA_CERTIFICATION_PRICE_EUR = 5;

export interface Permissions {
  /** Any paid tier (Patron, Professional, Enterprise) or Admin. Kept for
   *  places that only need a coarse "is this a paying account" check
   *  (e.g. UI badges) — NOT for feature gating. */
  isPaidTier: boolean;

  canSubmitProjects: boolean;
  /** null = unlimited */
  projectSubmissionLimit: number | null;

  canAccessRegistryCertificationTools: boolean; // Registry review, Validation/Admin services
  canAccessAPI: boolean;
  canAccessGovernance: boolean;
  canAccessLounge: boolean;

  swipeLimit: number | null;
  compareLimit: number | null;
  simulatorLimit: number | null;
  scanLimit: number | null;
  talentLimit: number | null;
}

const UNLIMITED = null;

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
      swipeLimit: 0,
      compareLimit: 0,
      simulatorLimit: 0,
      scanLimit: 0,
      talentLimit: 0,
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
      swipeLimit: UNLIMITED,
      compareLimit: UNLIMITED,
      simulatorLimit: UNLIMITED,
      scanLimit: UNLIMITED,
      talentLimit: UNLIMITED,
    };
  }

  const isProfessional = user.role === UserRole.PROFESSIONAL;
  const isEnterprise = !!user.isEnterprise; // institutional/catalog-scale accounts are Professionals with extra reach
  const isPatron = user.role === UserRole.PATRON;
  const isPaidTier = isProfessional || isPatron || !!user.isPro;

  // Discovery/comparison tooling: any paid tier (Patron included — this IS
  // the Patron's core value prop) gets unlimited access, matching the
  // "Unlimited Swipe / Compare / Tracking" promise on the pricing page.
  const discoveryLimits = isPaidTier
    ? { swipeLimit: UNLIMITED, compareLimit: UNLIMITED, simulatorLimit: UNLIMITED, scanLimit: UNLIMITED, talentLimit: UNLIMITED }
    : { swipeLimit: 20, compareLimit: 20, simulatorLimit: 4, scanLimit: 3, talentLimit: 3 };

  if (isProfessional) {
    return {
      isPaidTier: true,
      canSubmitProjects: true,
      projectSubmissionLimit: UNLIMITED,
      canAccessRegistryCertificationTools: true,
      canAccessAPI: true,
      canAccessGovernance: isEnterprise || !!user.isVerifiedValidator,
      canAccessLounge: isEnterprise || !!user.isVerifiedValidator,
      ...discoveryLimits,
    };
  }

  if (isPatron) {
    return {
      isPaidTier: true,
      // Patrons support and follow projects — they don't submit creative
      // work for certification. That's a Creator action.
      canSubmitProjects: false,
      projectSubmissionLimit: 0,
      canAccessRegistryCertificationTools: false,
      canAccessAPI: false,
      canAccessGovernance: !!user.isVerifiedValidator,
      canAccessLounge: !!user.isVerifiedValidator,
      ...discoveryLimits,
    };
  }

  // CREATOR (default) and any other/unknown role: free tier.
  const extra = user.extraCertifications || 0;
  return {
    isPaidTier: false,
    canSubmitProjects: true,
    projectSubmissionLimit: FREE_CREATOR_PROJECT_LIMIT + extra,
    canAccessRegistryCertificationTools: false,
    canAccessAPI: false,
    canAccessGovernance: !!user.isVerifiedValidator,
    canAccessLounge: !!user.isVerifiedValidator,
    ...discoveryLimits,
  };
}
