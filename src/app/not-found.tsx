// src/app/not-found.tsx
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import AnimatedSection from '@/components/invitation/AnimatedSection';

export default function NotFound() {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector('.mx-auto.max-w-md')?.clientWidth ?? window.innerWidth;
      const containerHeight = window.innerHeight;
      setIsPortrait(containerHeight > containerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderHeader = () => (
       <header className="relative h-[70vh] w-full overflow-hidden flex flex-col items-center">
           <div className="absolute inset-0 z-0">
                <Image
                  src={isPortrait ? "/images/Portada_2.jpeg" : "/images/Portada_h.jpg"}
                  alt="Portada de Boda Oscar y Silvia"
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={90}
                  priority
                  className="animate-zoom-loop"
                  data-ai-hint="boda pareja"
                />
           </div>
            <div className={cn(
                "relative z-10 flex flex-col items-center text-center text-white w-full h-full py-8 md:py-12 px-4",
                 isPortrait ? "justify-between" : "justify-end pb-8"
            )}>
                 <div className={cn(
                      "flex flex-col items-center w-full",
                      isPortrait ? "mt-4" : "mb-auto"
                 )}>
                     <h1 className={cn(
                         "font-julietta text-white select-none leading-none [text-shadow:0_0_15px_rgba(0,0,0,1)]",
                         "text-7xl",
                         !isPortrait && "opacity-50"
                     )}>
                         SilviOscar
                    </h1>
                 </div>
                <AnimatedSection animationType="fade" className={cn(
                    "delay-500",
                    isPortrait ? "mb-4" : "mt-auto w-full"
                )}>
                    <h2 className={cn(
                        "text-4xl font-julietta text-white [text-shadow:0_0_15px_rgba(0,0,0,1)]",
                         !isPortrait && "opacity-50"
                    )}>
                         ¡Nos casamos!
                    </h2>
                </AnimatedSection>
            </div>
       </header>
   );

  return (
    // This component will be rendered within the RootLayout's max-w-md container
    // So, these styles apply to the content area for the not-found page itself.
    <div className="flex flex-col min-h-full text-foreground overflow-x-hidden"> {/* min-h-full to use parent's height */}
      {renderHeader()}
      <div className="flex flex-col items-center justify-center text-center p-4 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Invitación no encontrada</h2>
        <p className="text-muted-foreground">Por favor, verifica el enlace o contacta a los novios.</p>
      </div>
       <footer className="text-center py-6 bg-muted/50 mt-auto">
          <p className="text-muted-foreground text-sm">Silvia &amp; Oscar - 26 julio 2025</p>
      </footer>
    </div>
  );
}
