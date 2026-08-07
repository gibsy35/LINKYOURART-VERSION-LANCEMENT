
import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CONTRACTS, Contract, LYA_UNIT_VALUE } from '../types';

// NOTE (August 2026): this hook previously simulated a fluctuating market
// price for each project -- a live setInterval nudged `unitValue` up/down
// every 4 seconds around a "$50 base", with a random fallback for `growth`
// when no real data existed, plus a fabricated "trading volume" figure.
// That directly contradicted LYA's certification-only positioning (the LYA
// unit price is fixed, not a negotiable/fluctuating instrument -- see the
// brochures and src/lib/permissions.ts). Removed: the LYA unit value is now
// always the fixed LYA_UNIT_VALUE, and no synthetic price/volume data is
// generated anywhere in this hook.

export const useMarketData = () => {
  const [firestoreContracts, setFirestoreContracts] = useState<Contract[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Real-time Firestore sync
  useEffect(() => {
    // Immediate bail if quota known to be reached
    if ((window as any).lya_quota_reached) {
      console.warn("Market sync skipped: Quota already reached.");
      setFirestoreContracts(CONTRACTS); // Fallback immediately
      return;
    }

    const contractsRef = collection(db, 'contracts');
    const q = query(contractsRef, limit(200));

    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => {
            const data = doc.data();

            const staticContract = CONTRACTS.find(c => c.id === doc.id || c.name === data.name);
            const defaultPillars = [
              { label: 'Project Quality', score: 150 },
              { label: 'Marketability', score: 140 },
              { label: 'Legal Security', score: 160 },
              { label: 'Technical Innovation', score: 150 },
              { label: 'Growth Potential', score: 130 }
            ];

            return {
              id: doc.id,
              ...data,
              name: data.name || staticContract?.name || 'Project ' + doc.id,
              category: data.category || staticContract?.category || 'Fine Art',
              image: data.image || staticContract?.image || `https://picsum.photos/seed/${encodeURIComponent(doc.id)}/800/600`,
              pillars: data.pillars && data.pillars.length === 5 ? data.pillars : (staticContract?.pillars || defaultPillars),
              // The LYA unit price is fixed and does not fluctuate -- see
              // note at the top of this file.
              unitValue: LYA_UNIT_VALUE,
              totalValue: parseFloat(data.totalValue || (LYA_UNIT_VALUE * (data.totalUnits || 1000))),
              availableUnits: parseInt(data.availableUnits || 0),
              scoreAlgo: data.scoreAlgo || 700,
              scorePro: data.scorePro || 700,
              scoreLYA: data.scoreLYA || data.totalScore || Math.round(((data.scoreAlgo || 700) + (data.scorePro || 700)) / 2),
              totalScore: data.scoreLYA || data.totalScore || Math.round(((data.scoreAlgo || 700) + (data.scorePro || 700)) / 2)
            } as Contract;
          });

          setFirestoreContracts(list);
        } else if (firestoreContracts.length === 0) {
          setFirestoreContracts(CONTRACTS);
        }
      }, (error) => {
        // Auto-unsubscribe on quota error
        if (unsubscribe) {
          try { unsubscribe(); } catch(e) {}
        }

        console.warn("Market sync interrupted:", error);
        handleFirestoreError(error, OperationType.GET, 'contracts');

        if (firestoreContracts.length === 0) {
          setFirestoreContracts(CONTRACTS);
        }
      });
    } catch (err) {
      console.error("Critical error setting up market snapshot:", err);
      setFirestoreContracts(CONTRACTS);
    }

    return () => {
      try {
        unsubscribe();
      } catch (e) { /* ignore */ }
    };
  }, []);

  // Category image dictionary to ensure high-quality, reliable, fully loading visual crops
  const categoryImages: Record<string, string> = {
    'Fine Art': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
    'Architecture': 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&q=80&w=800',
    'Podcast': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
    'Digital Art': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    'Film': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    'TV Series': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    'Music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    'Literature': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800',
    'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    'Design': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
    'Photography': 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?auto=format&fit=crop&q=80&w=800',
    'Performing Arts': 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=800',
    'Gastronomy': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
  };

  // Use Firestore if data exists, otherwise fallback to static
  const contracts = useMemo(() => {
    const rawList = firestoreContracts.length > 0 ? firestoreContracts : CONTRACTS;
    return rawList.map(contract => {
      // Official LYA Score formula: 0.70 * Committee (Expert) + 0.30 * Algo
      const algo = contract.scoreAlgo || 750;
      const pro = contract.scorePro || 750;
      const calculatedLYAScore = Math.min(1000, Math.round(0.70 * pro + 0.30 * algo));

      // Fallback Picsum photos or broken placeholders to reliable Unsplash assets
      let currentImg = contract.image || '';
      if (!currentImg || currentImg.includes('picsum.photos')) {
        currentImg = categoryImages[contract.category] || categoryImages['Fine Art'];
      }

      return {
        ...contract,
        image: currentImg,
        unitValue: LYA_UNIT_VALUE,
        scoreLYA: calculatedLYAScore,
        totalScore: calculatedLYAScore
      };
    });
  }, [firestoreContracts]);

  const marketStats = useMemo(() => {
    const totalCap = contracts.reduce((acc, c) => acc + c.totalValue, 0);
    const totalAvailable = contracts.reduce((acc, c) => acc + (c.availableUnits || 0), 0);
    const avgScore = contracts.length ? contracts.reduce((acc, c) => acc + (c.totalScore || 0), 0) / contracts.length : 0;

    return {
      totalCap,
      totalAvailable,
      avgScore,
      lastUpdate
    };
  }, [contracts, lastUpdate]);

  return {
    contracts,
    marketStats,
    lastUpdate
  };
};
