
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  DollarSign
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

// Initialize Stripe outside of component to avoid recreation
const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm: React.FC<{ 
  amount: number; 
  onSuccess: () => void; 
  onCancel: () => void;
  metadata: any;
  userEmail?: string;
  stripeCustomerId?: string;
}> = ({ amount, onSuccess, onCancel, metadata, userEmail, stripeCustomerId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // 1. Create Payment Intent on our server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          metadata: { 
            ...metadata,
            userEmail: userEmail || 'anonymous'
          },
          customerId: stripeCustomerId
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      // 2. Confirm payment on client
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement) as any,
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          setSucceeded(true);
          setTimeout(onSuccess, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Payment Successful</h2>
        <p className="text-on-surface-variant text-sm uppercase tracking-widest">{t('Finalizing transaction...', 'Finalisation de la transaction...')}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-surface-dim border border-white/10 rounded-sm">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4">
          Card Details
        </label>
        <div className="p-3 border border-white/5 bg-white/5 rounded-sm">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs uppercase font-bold">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.3em] hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('Processing...', 'Traitement...')}
            </>
          ) : (
            `${t('Pay', 'Payer')} ${formatPrice(amount)}`
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-3 border border-white/10 text-on-surface-variant font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-xs"
        >
          Cancel Transaction
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" referrerPolicy="no-referrer" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" referrerPolicy="no-referrer" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" referrerPolicy="no-referrer" />
      </div>
    </form>
  );
};

export const PaymentView: React.FC<{ 
  checkoutData: {
    type: 'PRO_UPGRADE' | 'ASSET_PURCHASE';
    amount: number;
    metadata: any;
    title: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
  userEmail?: string;
  stripeCustomerId?: string;
}> = ({ checkoutData, onSuccess, onCancel, userEmail, stripeCustomerId }) => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-white/5 transition-colors text-on-surface-variant"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-on-surface leading-[0.9] uppercase italic flex items-center gap-4">
            <div className="h-[2px] w-12 bg-primary-cyan"></div>
            <span>Secure <span className="text-primary-cyan">Checkout</span></span>
          </h1>
          <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Professional Payment Gateway</p>
        </div>
      </div>

      <div className="bg-surface-low border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/5">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-cyan block mb-2">{t('Transaction Detail', 'Détail de la Transaction')}</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">{checkoutData.title}</h2>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                {checkoutData.type === 'PRO_UPGRADE' ? t('LYA Membership Activation', 'Activation Adhésion LYA') : t('Asset Rights Acquisition', 'Acquisition de Droits d\'Actifs')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant block mb-1">{t('Total Amount', 'Montant Total')}</span>
              <div className="text-3xl font-black text-white italic">${checkoutData.amount.toLocaleString()}</div>
              <div className="text-[9px] font-bold text-primary-cyan uppercase tracking-widest">
                {t('ONE-TIME PAYMENT', 'PAIEMENT UNIQUE')}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              amount={checkoutData.amount} 
              metadata={checkoutData.metadata}
              onSuccess={onSuccess} 
              onCancel={onCancel} 
              userEmail={userEmail}
              stripeCustomerId={stripeCustomerId}
            />
          </Elements>
        </div>

        <div className="p-6 bg-surface-dim/50 border-t border-white/5 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            PCI Compliant
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
            <Lock className="w-3.5 h-3.5 text-primary-cyan" />
            256-bit SSL
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
            <CreditCard className="w-3.5 h-3.5 text-accent-gold" />
            Secure Processing
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-[9px] text-on-surface-variant uppercase tracking-widest leading-relaxed opacity-40">
        By completing this transaction, you agree to the LYA Professional Terms of Service. 
        Payments are processed securely via Stripe. No card data is stored on our servers.
      </p>
    </div>
  );
};
