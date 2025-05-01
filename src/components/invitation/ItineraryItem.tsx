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
    <Card className="text-center p-4 md:p-6 shadow-md border-none bg-background transition-transform hover:scale-105 duration-300">
      <CardContent className="flex flex-col items-center space-y-3">
        <Icon className="h-10 w-10 md:h-12 md:w-12 text-primary mb-2" />
        <p className="text-lg md:text-xl font-semibold">{time}</p>
        <p className="text-base md:text-lg text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ItineraryItem;
