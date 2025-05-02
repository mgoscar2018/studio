// src/components/invitation/Countdown.tsx
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

interface CountdownProps {
  targetDate: Date; // Accept Date object directly
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Indicate component has mounted on the client

    const calculateTimeLeft = () => {
      const now = new Date(); // Get current local time
      const totalSeconds = differenceInSeconds(targetDate, now);

      if (totalSeconds <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (timer) clearInterval(timer); // Stop the timer when the date is reached
        return;
      }

      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const remainingSecondsAfterDays = totalSeconds % (60 * 60 * 24);
      const hours = Math.floor(remainingSecondsAfterDays / (60 * 60));
      const remainingSecondsAfterHours = remainingSecondsAfterDays % (60 * 60);
      const minutes = Math.floor(remainingSecondsAfterHours / 60);
      const seconds = remainingSecondsAfterHours % 60;

      setTimeLeft({
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      });
    };

    // Calculate initial time left immediately
    calculateTimeLeft();

    // Update the countdown every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, [targetDate]); // Rerun effect if targetDate changes

  if (!isClient) {
    // Render placeholders or loading state on the server/during hydration
    return (
      <div className="grid grid-cols-4 gap-2 md:gap-4 text-center font-mono">
        <div className="bg-primary/10 p-3 rounded-lg shadow-sm"><div className="text-3xl md:text-5xl font-bold">-</div><div className="text-xs md:text-sm uppercase">Días</div></div>
        <div className="bg-primary/10 p-3 rounded-lg shadow-sm"><div className="text-3xl md:text-5xl font-bold">-</div><div className="text-xs md:text-sm uppercase">Horas</div></div>
        <div className="bg-primary/10 p-3 rounded-lg shadow-sm"><div className="text-3xl md:text-5xl font-bold">-</div><div className="text-xs md:text-sm uppercase">Minutos</div></div>
        <div className="bg-primary/10 p-3 rounded-lg shadow-sm"><div className="text-3xl md:text-5xl font-bold">-</div><div className="text-xs md:text-sm uppercase">Segundos</div></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 text-center font-mono">
      <div className="bg-primary/10 p-3 rounded-lg shadow-sm">
        <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
        <div className="text-xs md:text-sm uppercase">Días</div>
      </div>
      <div className="bg-primary/10 p-3 rounded-lg shadow-sm">
        <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-xs md:text-sm uppercase">Horas</div>
      </div>
      <div className="bg-primary/10 p-3 rounded-lg shadow-sm">
        <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-xs md:text-sm uppercase">Minutos</div>
      </div>
      <div className="bg-primary/10 p-3 rounded-lg shadow-sm">
        <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-xs md:text-sm uppercase">Segundos</div>
      </div>
    </div>
  );
};

export default Countdown;