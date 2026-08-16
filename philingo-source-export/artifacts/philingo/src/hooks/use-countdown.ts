import { useState, useEffect } from 'react';

function computeTimeLeft(targetDate: string | Date) {
  const target = new Date(targetDate).getTime();
  const distance = target - Date.now();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  return {
    days:    Math.floor(distance / 86400000),
    hours:   Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
    isExpired: false,
  };
}

export function useCountdown(targetDate: string | Date) {
  // Initialise immediately so the first render shows the correct value
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(targetDate));

  useEffect(() => {
    // Recalculate when targetDate changes
    setTimeLeft(computeTimeLeft(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}
