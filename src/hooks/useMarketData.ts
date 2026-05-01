
import { useState, useEffect, useMemo } from 'react';
import { CONTRACTS, Contract } from '../types';

export const useMarketData = () => {
  const [contracts, setContracts] = useState<Contract[]>(CONTRACTS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setContracts(prev => prev.map(contract => {
        // Small fluctuation 
        const fluctuation = (Math.random() - 0.5) * 0.4; 
        const newGrowth = parseFloat((contract.growth + fluctuation).toFixed(2));
        
        // Price should reflect the growth from a base of 50.00
        // currentPrice = basePrice * (1 + (growth / 100))
        const basePrice = 50.00;
        const newUnitValue = parseFloat((basePrice * (1 + (newGrowth / 100))).toFixed(2));

        return {
          ...contract,
          growth: newGrowth,
          unitValue: Math.max(0.01, newUnitValue) // Prevent negative or zero price
        };
      }));
      setLastUpdate(new Date());
    }, 4000); 

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
