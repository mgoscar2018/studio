// src/components/invitation/PadrinoItem.tsx
import type React from 'react';
// import type { LucideIcon } from 'lucide-react'; // No longer strictly LucideIcon

interface PadrinoItemProps {
  icon: React.ElementType; // Changed to React.ElementType to accept any icon component
  names: string;
  role: string;
}

const PadrinoItem: React.FC<PadrinoItemProps> = ({ icon: Icon, names, role }) => {
  return (
    // Reduced padding from p-3 to p-2 and space-x-4 to space-x-3
    <div className="flex items-center space-x-3 p-2 bg-background rounded-lg shadow-sm hover:bg-secondary/5 transition-colors duration-200">
      <div className="flex-shrink-0 text-primary">
        <Icon className="h-5 w-5 md:h-6 md:w-6" /> {/* Slightly reduced icon size */}
      </div>
      <div className="text-left">
        <p className="font-semibold text-sm md:text-base">{names}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
};

export default PadrinoItem;
