
import { useState, useEffect, useMemo } from 'react';
import { CONTRACTS, Contract } from '../types';

export const useMarketData = () => {
  const [contracts, setContracts] = useState<Contract[]>(CONTRACTS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setContracts(prev => prev.map(contract => {
        // Small fluctuation with a slight bearish bias for realism
        const fluctuation = (Math.random() - 0.55) * 0.2; // -0.11 to +0.09 shift
        const newGrowth = parseFloat((contract.growth + fluctuation).toFixed(2));
        
        // Occasionally change unit value slightly (simulating market depth)
        const priceFluctuation = (Math.random() - 0.52) * 0.02;
        const newUnitValue = parseFloat((contract.unitValue + priceFluctuation).toFixed(2));

        return {
          ...contract,
          growth: newGrowth,
          unitValue: newUnitValue
        };
      }));
      setLastUpdate(new Date());
    }, 3000); // Update every 3 seconds for "life"

    return () => clearInterval(interval);
  }, []);

  const marketStats = useMemo(() => {
    const totalCap = contracts.reduce((acc, c) => acc + c.totalValue, 0);
    const totalAvailable = contracts.reduce((acc, c) => acc + (c.availableUnits || 0), 0);
    const avgGrowth = contracts.reduce((acc, c) => acc + c.growth, 0) / contracts.length;
    const totalVolume = totalCap * 0.034; // Simulated volume
    
    return {
      totalCap,
      totalAvailable,
      avgGrowth,
      totalVolume,
      lastUpdate
    };
  }, [contracts, lastUpdate]);

  return {
    contracts,
    marketStats,
    lastUpdate
  };
};
