
import React, { useEffect, useState, useRef } from 'react';

export const NumberTicker: React.FC<{ value: number, duration?: number, decimalPlaces?: number }> = ({ 
  value, 
  duration = 1500,
  decimalPlaces = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset animation when value changes
    startValue.current = displayValue;
    startTime.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      const currentVal = startValue.current + (value - startValue.current) * progress;
      setDisplayValue(currentVal);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  })}</span>;
};
