'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// Replaced Ring with Gem as Ring does not exist in lucide-react
import { Play, BookOpen, Gem, Diamond, HandHeart, MapPin, CalendarDays, Clock, Music, Users, CheckCircle, XCircle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Countdown from '@/components/invitation/Countdown';
import ItineraryItem from '@/components/invitation/ItineraryItem';
import PadrinoItem from '@/components/invitation/PadrinoItem';
import ConfirmationForm from '@/components/invitation/ConfirmationForm';
import AnimatedSection from '@/components/invitation/AnimatedSection';
// Mock function, replace with actual data fetching
// import { getMusic } from '@/services/music';

// Placeholder data - Replace with actual data fetching logic
const invitationId = 'unique-invitation-id'; // Example ID, should come from URL params or props
const weddingDate = new Date('2025-07-26T14:00:00');
const groomName = "Oscar"; // Replace with actual groom name
const brideName = "Silvia"; // Replace with actual bride name
const assignedPasses = 4; // Example, fetch from backend

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
const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`;

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [confirmedGuests, setConfirmedGuests] = useState<string[]>([]); // State for confirmed guests
  const [isRejected, setIsRejected] = useState<boolean>(false); // State for rejection status

  // Fetch music URL based on invitationId (replace with actual API call)
  useEffect(() => {
    const fetchMusic = async () => {
      // const musicData = await getMusic(invitationId);
      // Simulating API call
      const musicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder music
      const audioElement = new Audio(musicUrl);
      audioElement.loop = true;
      setAudio(audioElement);
    };
    fetchMusic();

    // Clean up audio element on unmount
    return () => {
      audio?.pause();
      setAudio(null);
    };
  }, [invitationId]); // Re-fetch if invitationId changes (though likely static for a single page)

  // Fetch confirmation status (replace with actual API call)
   useEffect(() => {
    const fetchConfirmation = async () => {
        // Replace with API call to fetch confirmation status and guests for invitationId
        // Example: const response = await fetch(`/api/confirmations/${invitationId}`);
        // const data = await response.json();
        // setConfirmedGuests(data.guests || []);
        // setIsRejected(data.rejected || false);

        // Placeholder data for testing
        // setConfirmedGuests(["Juan Perez", "Maria Lopez"]);
        // setIsRejected(true);
    };
    fetchConfirmation();
  }, [invitationId]);


  const togglePlayPause = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => console.error("Audio playback failed:", error)); // Basic error handling
    }
    setIsPlaying(!isPlaying);
  };

  const handleConfirmation = (guests: string[], rejected: boolean) => {
     // Replace with API call to submit confirmation
     // Example: await fetch(`/api/confirmations/${invitationId}`, { method: 'POST', body: JSON.stringify({ guests, rejected }) });
     console.log("Confirmation submitted:", { guests, rejected });
     setConfirmedGuests(guests);
     setIsRejected(rejected);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Portada Section */}
      <header className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"> {/* Removed 'group' class */}
        <Image
          src="https://picsum.photos/seed/weddingcover/1440/720"
          alt="Portada de Boda"
          layout="fill"
          objectFit="cover"
          quality={90}
          priority
          className="transition-transform duration-500 ease-in-out animate-zoom-loop" // Removed group-hover:scale-105, added animate-zoom-loop
          data-ai-hint="wedding couple elegant landscape"
        />
         {/* Parallax Logo */}
         <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: 'translateZ(-10px) scale(1.1)' }} // Example Parallax effect
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
                <Play className={`h-8 w-8 ${isPlaying ? 'fill-primary' : ''}`} />
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
                   plugins={[
                    // Autoplay({ // Uncomment if you install embla-carousel-autoplay
                    //   delay: 30000, // 30 seconds
                    //   stopOnInteraction: false,
                    // }),
                  ]}
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
                                      layout="fill"
                                      objectFit="cover"
                                      className="transition-transform duration-500 ease-in-out group-hover:scale-105"
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
