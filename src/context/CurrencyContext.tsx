
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CHF';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
  formatLYA: () => string;
  exchangeRates: Record<Currency, number>;
}

// Rebased to EUR (was USD). LinkYourArt is a French SASU, operating primarily
// across Paris/Rennes/London — the $-based pricing was a leftover from the
// earlier "financial exchange" model (LYA Units traded like securities in
// USD). Under the Phase 1 certification-only model there's no reason to
// anchor on USD anymore. All prices in the codebase (LYA_UNIT_VALUE, plan
// prices, etc.) are now authored directly in EUR; this table converts FROM
// that EUR baseline to whichever display currency the visitor picks.
// NOTE: these rates are static, not live — same limitation as before the
// rebase. Worth wiring to a real FX feed if international pricing precision
// starts to matter.
const exchangeRates: Record<Currency, number> = {
  EUR: 1.0,
  USD: 1.09,
  GBP: 0.86,
  JPY: 171.3,
  CHF: 0.94,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('EUR');

  const formatPrice = (amount: number) => {
    const converted = amount * exchangeRates[currency];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(converted);
  };

  const formatLYA = () => {
    return formatPrice(50); // LYA_UNIT_VALUE is 50 (EUR)
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatLYA, exchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
