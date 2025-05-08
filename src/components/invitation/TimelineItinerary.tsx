// src/components/invitation/TimelineItinerary.tsx
'use client';

import type React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Heart } from 'lucide-react'; // Using Lucide Heart, will fill with CSS or use SVG if needed for solid fill
import { cn } from '@/lib/utils';

interface ItineraryItem {
  icon: LucideIcon;
  time: string;
  description: string;
}

interface TimelineItineraryProps {
  items: ItineraryItem[];
}

const TimelineItinerary: React.FC<TimelineItineraryProps> = ({ items }) => {
  const HeartIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor" // Filled heart
      stroke="currentColor"
      strokeWidth="1" // Thin stroke to match example
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  return (
    <div className="relative w-full py-8">
      {/* Vertical timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary/30" aria-hidden="true"></div>

      <div className="space-y-8">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              className={cn(
                'relative flex w-full items-center',
                isEven ? 'justify-start' : 'justify-end'
              )}
            >
              {/* Item Content */}
              <div
                className={cn(
                  'w-[calc(50%-2.5rem)] p-3 rounded-lg shadow-md bg-background border border-primary/20',
                  isEven ? 'text-left order-1' : 'text-right order-3'
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-3',
                    isEven ? 'justify-start' : 'justify-end flex-row-reverse'
                  )}
                >
                  <IconComponent className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">{item.description}</p>
                    <p className="text-lg font-bold text-primary">{item.time}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Connector & Heart */}
              <div
                className={cn(
                  'absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center order-2',
                )}
              >
                <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
                  <HeartIcon />
                </div>
              </div>
              
              {/* Horizontal line from item to timeline */}
              <div 
                className={cn(
                  "absolute top-1/2 h-0.5 w-[calc(50%-2.5rem-1.5rem)] bg-primary/30 order-2", // -1.5rem for half of heart + padding
                  isEven ? "left-[calc(50%+1.5rem)]" : "right-[calc(50%+1.5rem)]"
                )}
              ></div>


            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineItinerary;
