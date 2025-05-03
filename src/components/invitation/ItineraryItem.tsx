// src/components/invitation/ItineraryItem.tsx
import type React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ItineraryItemProps {
  icon: LucideIcon;
  time: string;
  description: string;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({ icon: Icon, time, description }) => {
  return (
    // Reduced padding from p-4 md:p-6 to p-4
    <Card className="text-center p-4 shadow-md border-none bg-background transition-transform hover:scale-105 duration-300">
      <CardContent className="flex flex-col items-center space-y-2"> {/* Reduced space-y */}
        <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-1" /> {/* Reduced icon size and margin */}
        <p className="text-base md:text-lg font-semibold">{time}</p>
        <p className="text-sm md:text-base text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ItineraryItem;