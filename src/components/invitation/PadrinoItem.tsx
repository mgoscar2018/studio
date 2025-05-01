// src/components/invitation/PadrinoItem.tsx
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PadrinoItemProps {
  icon: LucideIcon;
  names: string;
  role: string;
}

const PadrinoItem: React.FC<PadrinoItemProps> = ({ icon: Icon, names, role }) => {
  return (
    <div className="flex items-center space-x-4 p-3 bg-background rounded-lg shadow-sm hover:bg-secondary/5 transition-colors duration-200">
      <div className="flex-shrink-0 text-primary">
        <Icon className="h-6 w-6 md:h-7 md:w-7" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-base md:text-lg">{names}</p>
        <p className="text-sm md:text-base text-muted-foreground">{role}</p>
      </div>
    </div>
  );
};

export default PadrinoItem;
