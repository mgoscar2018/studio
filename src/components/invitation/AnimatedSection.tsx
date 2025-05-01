// src/components/invitation/AnimatedSection.tsx
 'use client';

 import type React from 'react';
 import { useRef, useEffect, useState } from 'react';
 import { cn } from '@/lib/utils';

 type AnimationType = 'fade' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown';

 interface AnimatedSectionProps {
   children: React.ReactNode;
   className?: string;
   animationType?: AnimationType;
   threshold?: number; // Intersection Observer threshold (0 to 1)
   delay?: string; // Tailwind delay class e.g., 'delay-300'
   duration?: string; // Tailwind duration class e.g., 'duration-1000'
   once?: boolean; // Trigger animation only once
 }

 const AnimatedSection: React.FC<AnimatedSectionProps> = ({
   children,
   className,
   animationType = 'fade',
   threshold = 0.1, // Start animation when 10% is visible
   delay = 'delay-100',
   duration = 'duration-700',
   once = true,
 }) => {
   const [isVisible, setIsVisible] = useState(false);
   const sectionRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
     const observer = new IntersectionObserver(
       ([entry]) => {
         if (entry.isIntersecting) {
           setIsVisible(true);
           if (once && sectionRef.current) {
             observer.unobserve(sectionRef.current); // Stop observing after first trigger if 'once' is true
           }
         } else if (!once) {
             // Optionally reset animation if it should trigger every time
             // setIsVisible(false);
         }
       },
       {
         threshold: threshold,
       }
     );

     const currentRef = sectionRef.current;
     if (currentRef) {
       observer.observe(currentRef);
     }

     return () => {
       if (currentRef) {
         observer.unobserve(currentRef);
       }
     };
   }, [threshold, once]); // Rerun observer setup if threshold or once changes

   const animationClasses: Record<AnimationType, string> = {
        fade: 'fade-in',
        slideInLeft: 'slide-in-left',
        slideInRight: 'slide-in-right',
        slideInUp: 'animate-[slideInUp_0.8s_ease-out_forwards]', // Requires custom animation
        slideInDown: 'animate-[slideInDown_0.8s_ease-out_forwards]', // Requires custom animation
   };

    // Define custom animations if needed in globals.css or tailwind.config.js
    /* Example in globals.css:
    @keyframes slideInUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideInDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    */

   return (
     <div
       ref={sectionRef}
       className={cn(
         'transition-opacity', // Base transition class
         isVisible ? `${animationClasses[animationType]} ${delay} ${duration} opacity-100` : 'opacity-0',
         className
       )}
     >
       {children}
     </div>
   );
 };

 export default AnimatedSection;
