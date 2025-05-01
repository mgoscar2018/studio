// src/app/page.tsx
'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react'; // Import useRef
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// Replaced Ring with Gem as Ring does not exist in lucide-react
import { Play, BookOpen, Gem, Diamond, HandHeart, MapPin, CalendarDays, Clock, Music, Users, CheckCircle, XCircle, Volume2, VolumeX } from 'lucide-react'; // Added Volume icons
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Countdown from '@/components/invitation/Countdown';
import ItineraryItem from '@/components/invitation/ItineraryItem';
import PadrinoItem from '@/components/invitation/PadrinoItem';
import ConfirmationForm from '@/components/invitation/ConfirmationForm';
import AnimatedSection from '@/components/invitation/AnimatedSection';
// Mock function, replace with actual data fetching
import { getMusic, getConfirmation, submitConfirmation, getAssignedPasses } from '@/services/music';


// Placeholder data - Replace with actual data fetching logic
const invitationId = 'unique-invitation-id'; // Example ID, should come from URL params or props
const weddingDate = new Date('2025-07-26T14:00:00');
const groomName = "Oscar"; // Replace with actual groom name
const brideName = "Silvia"; // Replace with actual bride name

const photos = [
  { src: "https://picsum.photos/seed/p1/1440/720", alt: "Photo 1", hint: "couple romantic beach" },
  { src: "https://picsum.photos/seed/p2/1440/720", alt: "Photo 2", hint: "wedding rings detail" },
  { src: "https://picsum.photos/seed/p3/1440/720", alt: "Photo 3", hint: "couple laughing park" },
  { src: "https://picsum.photos/seed/p4/1440/720", alt: "Photo 4", hint: "engagement photo city" },
  { src: "https://picsum.photos/seed/p5/1440/720", alt: "Photo 5", hint: "couple silhouette sunset" },
];

const padres = [
  "MA. ARACELI GONGORA",
  "SILVIANO GARCIA X.",
  "ELIA GOMEZ MORENO",
  "MARIO MIRANDA SALGADO"
];

const padrinos = [
  { icon: BookOpen, names: "Sandra & Pedro", role: "Padrinos de Biblia" },
  { icon: Gem, names: "Lorena & Eduardo", role: "Padrinos de Anillos" }, // Changed Ring to Gem
  { icon: Diamond, names: "Fernanda & Luis", role: "Padrinos de Aras" },
  { icon: HandHeart, names: "María & Daniel", role: "Padrinos de Lazo" },
];

const itinerary = [
  { icon: CalendarDays, time: "2:00 p.m.", description: "Ceremonia" },
  { icon: Clock, time: "3:00 p.m.", description: "Cóctel" },
  { icon: Users, time: "4:00 p.m.", description: "Banquete" },
  { icon: Music, time: "5:00 p.m.", description: "Inicia la Fiesta" },
];

const locationAddress = "Av. Jiutepec #87, esquina Paseo de las Rosas. Colonia Atlacomulco, C.P. 62560, Jiutepec, Morelos.";
// Updated Google Maps URL to the specific one requested
const googleMapsUrl = "https://maps.app.goo.gl/RCKCQHaGdfsZZzpz9";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false); // Initial state, will be updated by autoplay attempt
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [confirmedGuests, setConfirmedGuests] = useState<string[]>([]); // State for confirmed guests
  const [isRejected, setIsRejected] = useState<boolean>(false); // State for rejection status
  const [assignedPasses, setAssignedPasses] = useState<number>(0); // State for assigned passes
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to manage the audio element directly
  const hasInteracted = useRef(false); // Track user interaction for autoplay policy


  // Combined useEffect for fetching initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [musicData, confirmationData, passesData] = await Promise.all([
          getMusic(invitationId),
          getConfirmation(invitationId),
          getAssignedPasses(invitationId)
        ]);

        // Setup Audio
        const audioElement = new Audio(musicData.musicUrl);
        audioElement.loop = true;
        audioRef.current = audioElement; // Store in ref
        setAudio(audioElement); // Also store in state if needed elsewhere

        // Set Confirmation Data
        if (confirmationData) {
            setConfirmedGuests(confirmationData.guests || []);
            setIsRejected(confirmationData.rejected || false);
        }

        // Set Assigned Passes
        setAssignedPasses(passesData);

         // Attempt Autoplay after setting up audio
         attemptAutoplay();

      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Handle error state if needed
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Add interaction listener for autoplay (only if needed as a fallback)
    const handleInteraction = () => {
        if (!hasInteracted.current) {
            hasInteracted.current = true;
            if (!isPlaying) { // Only attempt play if not already playing
                attemptAutoplay(); // Try playing again on first interaction
            }
            // Remove listeners after first interaction regardless of play success
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);


    // Clean up audio element and listeners on unmount
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      setAudio(null);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [invitationId]); // isPlaying removed from dependency array to avoid re-running on state change


 const attemptAutoplay = () => {
     if (audioRef.current) { // Don't check isPlaying here, always attempt
        audioRef.current.play().then(() => {
             setIsPlaying(true); // Update state ONLY if autoplay succeeds
             console.log("Autoplay successful.");
        }).catch(error => {
             console.log("Autoplay prevented:", error);
             // Autoplay was prevented, user needs to interact
             setIsPlaying(false); // Ensure state reflects that music is not playing
        });
     }
 };


  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Manually triggered play should generally work after interaction or if allowed
      audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
    }
    setIsPlaying(!isPlaying); // Toggle state regardless of play success/failure for user feedback
  };

  const handleConfirmation = async (guests: string[], rejected: boolean) => {
     try {
        await submitConfirmation(invitationId, { guests, rejected });
        console.log("Confirmation submitted:", { guests, rejected });
        setConfirmedGuests(guests);
        setIsRejected(rejected);
     } catch (error) {
         console.error("Failed to submit confirmation:", error);
         // Optionally show a toast or error message to the user
     }
  };

   if (isLoading) {
     // Optional: Render a loading indicator while fetching data
     return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
   }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Portada Section */}
      <header className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src="https://picsum.photos/seed/weddingcover/1440/720"
          alt="Portada de Boda"
          fill
          style={{ objectFit: "cover" }}
          quality={90}
          priority
          className="transition-transform duration-500 ease-in-out animate-zoom-loop"
          data-ai-hint="wedding couple elegant landscape"
        />
         {/* Parallax Logo */}
         <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
          >
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-playfair text-white opacity-80 text-center select-none">
               {brideName} <span className="text-3xl md:text-5xl lg:text-7xl">&</span> {groomName}
            </h1>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div> {/* Overlay */}
      </header>

      <main className="container mx-auto px-4 py-12 md:px-8 md:py-16 space-y-16 md:space-y-24">
        {/* Título de la Boda */}
         <AnimatedSection animationType="slideInLeft">
          <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-playfair">¡Nos casamos!</h2>
              <p className="text-2xl md:text-3xl">Sábado</p>
              <div className="inline-block bg-primary text-primary-foreground rounded-lg p-4 md:p-6 shadow-md">
                  <div className="text-6xl md:text-8xl font-bold">26</div>
                  <div className="text-xl md:text-2xl">julio</div>
              </div>
              <p className="text-2xl md:text-3xl mt-2">2025</p>
          </div>
        </AnimatedSection>

        <Separator className="my-12 md:my-16" />

        {/* Mensaje de los Novios */}
         <AnimatedSection animationType="slideInRight">
            <Card className="shadow-lg border-none bg-secondary/10 p-6 md:p-8 rounded-lg">
                <CardContent>
                <p className="text-lg md:text-xl text-center italic">
                    "Todos los días juntos son días maravillosos y queremos que nos acompañen en el más importante de nosotros."
                </p>
                </CardContent>
            </Card>
         </AnimatedSection>

        <Separator className="my-12 md:my-16" />

        {/* Música y Cuenta Regresiva */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <AnimatedSection animationType="slideInLeft" className="flex flex-col items-center space-y-4">
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Música de Fondo</h3>
                <Button
                variant="outline"
                size="icon"
                className="rounded-full h-16 w-16 border-2 border-primary hover:bg-primary/10"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
                >
                {/* Use Volume2 for playing and VolumeX for paused/muted */}
                 {isPlaying ? <Volume2 className="h-8 w-8 text-primary" /> : <VolumeX className="h-8 w-8 text-muted-foreground" />}
                </Button>
            </AnimatedSection>

            <AnimatedSection animationType="slideInRight" className="text-center">
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Sólo Faltan</h3>
                <Countdown targetDate={weddingDate} />
            </AnimatedSection>
        </div>

        <Separator className="my-12 md:my-16" />

        {/* Carrousel de Fotos */}
         <AnimatedSection animationType="fade">
             <h3 className="text-3xl md:text-4xl font-semibold text-center mb-8">Nuestros Momentos</h3>
              <Carousel
                  opts={{
                  align: "start",
                  loop: true,
                  }}
                   // plugins={[ Autoplay({ delay: 5000, stopOnInteraction: false }) ]} // Example Autoplay
                  className="w-full max-w-4xl mx-auto"
              >
                  <CarouselContent>
                  {photos.map((photo, index) => (
                      <CarouselItem key={index} className="group">
                           <Card className="overflow-hidden border-none shadow-lg">
                              <CardContent className="p-0 aspect-video relative">
                                  <Image
                                      src={photo.src}
                                      alt={photo.alt}
                                      fill // Use fill for responsive layout
                                      style={{ objectFit: "cover" }} // Use style for objectFit
                                      className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes for optimization
                                      data-ai-hint={photo.hint}
                                  />
                              </CardContent>
                           </Card>
                      </CarouselItem>
                  ))}
                  </CarouselContent>
                   <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden md:flex" />
                   <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden md:flex" />
              </Carousel>
         </AnimatedSection>

        <Separator className="my-12 md:my-16" />

        {/* Padres y Padrinos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <AnimatedSection animationType="slideInLeft" className="text-center">
                <h3 className="text-3xl md:text-4xl font-semibold mb-6">Nuestros Padres</h3>
                <div className="space-y-2 text-lg">
                {padres.map((nombre, index) => (
                    <p key={index}>{nombre}</p>
                ))}
                </div>
             </AnimatedSection>

            <AnimatedSection animationType="slideInRight" className="text-center">
                <h3 className="text-3xl md:text-4xl font-semibold mb-6">Nuestros Padrinos</h3>
                 <div className="space-y-4">
                      {padrinos.map((padrino, index) => (
                           <PadrinoItem key={index} icon={padrino.icon} names={padrino.names} role={padrino.role} />
                      ))}
                 </div>
             </AnimatedSection>
        </div>

        <Separator className="my-12 md:my-16" />

        {/* Itinerario */}
         <AnimatedSection animationType="fade">
            <h3 className="text-3xl md:text-4xl font-semibold text-center mb-8">Itinerario</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {itinerary.map((item, index) => (
                     <ItineraryItem key={index} icon={item.icon} time={item.time} description={item.description} />
                ))}
            </div>
        </AnimatedSection>

        <Separator className="my-12 md:my-16" />

        {/* Ubicación */}
         <AnimatedSection animationType="slideInUp"> {/* Using a different animation for variety */}
            <Card className="text-center shadow-lg border-none bg-secondary/10 p-6 md:p-8 rounded-lg">
                 <CardHeader>
                    <CardTitle className="text-3xl md:text-4xl font-semibold flex items-center justify-center gap-2">
                        <MapPin className="h-8 w-8 text-primary" />
                        Ubicación
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg">{locationAddress}</p>
                     <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                             Abrir en GPS
                        </a>
                     </Button>
                </CardContent>
            </Card>
         </AnimatedSection>


        <Separator className="my-12 md:my-16" />

         {/* Confirmación de Asistencia */}
         <AnimatedSection animationType="fade">
             <h3 className="text-3xl md:text-4xl font-semibold text-center mb-8">Confirma tu Asistencia</h3>

             {isRejected ? (
                <Card className="bg-muted/50 p-6 rounded-lg shadow">
                  <CardContent className="flex items-center gap-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                    <p className="text-muted-foreground">Lamentamos no poder contar con tu presencia y agradecemos mucho tu respuesta, ya que con ello podremos organizar óptimamente los lugares.</p>
                  </CardContent>
                </Card>
             ) : confirmedGuests.length > 0 ? (
                 <Card className="bg-secondary/10 p-6 rounded-lg shadow">
                     <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                            <CheckCircle className="h-6 w-6" />
                            ¡Confirmación Recibida!
                           </CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="mb-4">Gracias por confirmar. Has reservado lugar para:</p>
                          <ul className="list-disc list-inside space-y-1">
                             {confirmedGuests.map((guest, index) => (
                                <li key={index}>{guest}</li>
                             ))}
                          </ul>
                      </CardContent>
                 </Card>
             ) : (
                 <ConfirmationForm
                    invitationId={invitationId}
                    assignedPasses={assignedPasses}
                    onConfirm={handleConfirmation}
                 />
             )}
        </AnimatedSection>

      </main>

      <footer className="text-center py-8 bg-muted/50 mt-16">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} {brideName} & {groomName}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
