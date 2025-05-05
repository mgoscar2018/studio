// src/app/page.tsx
'use client';

import type React from 'react';
import { useState, useEffect, useRef, Suspense } from 'react'; // Import Suspense
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Gem, Diamond, HandHeart, MapPin, CalendarDays, Clock, Music, Users, CheckCircle, XCircle, Volume2, VolumeX, Sofa } from 'lucide-react'; // Added Volume icons and Sofa
import Countdown from '@/components/invitation/Countdown';
import ItineraryItem from '@/components/invitation/ItineraryItem';
import PadrinoItem from '@/components/invitation/PadrinoItem';
import ConfirmationForm from '@/components/invitation/ConfirmationForm';
import AnimatedSection from '@/components/invitation/AnimatedSection';
// Import MongoDB service functions
import { getInvitationData, submitConfirmation, type InvitationData } from '@/services/invitation';
import { cn } from '@/lib/utils'; // Import cn utility

// Wedding date with Mexico City timezone offset (GMT-6)
const weddingDate = new Date('2025-07-26T14:00:00-06:00');

// Removed static groom/bride names - fetched from DB
const padres = [
  "MA. ARELI GONGORA OCAMPO",
  "SILVIANO GARCIA AYALA",
  "ELIA GOMEZ MORENO",
  "MARIO MIRANDA SALGADO"
];

const padrinos = [
  { icon: BookOpen, names: "Ricardo Garcia & Adriana Sotelo", role: "Padrinos de Biblia" },
  { icon: Gem, names: "Lorena & Eduardo", role: "Padrinos de Anillos" },
  { icon: Diamond, names: "Roberto de León & Claudia Valencia", role: "Padrinos de Arras" },
  { icon: HandHeart, names: "Polly Lagunas & Minerva Gongora", role: "Padrinos de Lazo" },
  { icon: Sofa, names: "Luis Luviano & Carmen Castrejón", role: "Padrinos de Cojines" },
];

const itinerary = [
  { icon: CalendarDays, time: "2:00 p.m.", description: "Ceremonia" },
  { icon: Clock, time: "3:00 p.m.", description: "Cóctel" },
  { icon: Users, time: "4:00 p.m.", description: "Banquete" },
  { icon: Music, time: "5:00 p.m.", description: "Inicia la Fiesta" },
];

const locationAddress = "Av. Jiutepec #87, esquina Paseo de las Rosas. Colonia Atlacomulco, C.P. 62560, Jiutepec, Morelos.";
const googleMapsUrl = "https://maps.app.goo.gl/RCKCQHaGdfsZZzpz9";

function InvitationPageContent() {
  const searchParams = useSearchParams();
  const initialInvitationId = searchParams.get('id'); // Get 'id' param

  const [invitationId, setInvitationId] = useState<string | null>(initialInvitationId);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State derived from invitationData
  const [confirmedGuests, setConfirmedGuests] = useState<string[]>([]);
  const [isRejected, setIsRejected] = useState<boolean>(false);
  const [assignedPasses, setAssignedPasses] = useState<number>(0);
  const [invitationName, setInvitationName] = useState<string>('');
  const [groomName, setGroomName] = useState<string>('Novio'); // Default placeholder
  const [brideName, setBrideName] = useState<string>('Novia'); // Default placeholder

  // Update invitationId if URL changes
  useEffect(() => {
    setInvitationId(searchParams.get('id'));
  }, [searchParams]);

  // Handle screen orientation changes
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector('.mx-auto.max-w-md')?.clientWidth ?? window.innerWidth;
      const containerHeight = window.innerHeight;
      setIsPortrait(containerHeight > containerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

   // Fetch Invitation Data from MongoDB and Setup Audio
   useEffect(() => {
    if (!invitationId) {
      setError("ID de invitación no proporcionado en la URL.");
      setIsLoading(false);
      return;
    }

    let audioElement: HTMLAudioElement | null = null;
    let isMounted = true;

    const handlePlay = () => { if (isMounted) setIsPlaying(true); };
    const handlePause = () => { if (isMounted) setIsPlaying(false); };
    const handleEnded = () => { if (isMounted) setIsPlaying(false); };
    const handleError = (e: Event) => { console.error("Audio Error:", e); };

    const fetchData = async () => {
      setIsLoading(true);
      setError(null); // Reset error on new fetch
      console.log(`Fetching data for invitation ID: ${invitationId}...`);

      try {
        const data = await getInvitationData(invitationId);

        if (!isMounted) return;

        if (!data) {
          console.log(`Invitation ID ${invitationId} not found in database.`);
          setError("Invitación no encontrada. Por favor, verifica el enlace.");
          setInvitationData(null);
          setIsLoading(false);
          return; // Stop further processing
        }

        console.log("Invitation data fetched successfully:", data);
        setInvitationData(data);

        // Update state based on fetched data
        setInvitationName(data.Nombre || 'Invitado/a');
        setAssignedPasses(data.PasesAsignados || 0);
        setConfirmedGuests(data.Asistentes || []);
        // Determine rejection status based on Confirmado and PasesConfirmados
        setIsRejected(data.Confirmado && data.PasesConfirmados === 0);
        // Set Groom/Bride names (assuming they are part of the data or fetched separately)
        // If not available in this fetch, you might need another service call or adjust InvitationData interface
        // For now, using placeholders if not directly in `data`
        // setGroomName(data.groomName || 'Oscar'); // Example: Adjust if names are in data
        // setBrideName(data.brideName || 'Silvia'); // Example: Adjust if names are in data
        setGroomName('Oscar'); // Keeping static for now
        setBrideName('Silvia'); // Keeping static for now


        // Setup Audio Element
        audioElement = document.createElement('audio');
        audioElement.loop = true;
        const opusSource = document.createElement('source');
        opusSource.src = '/music/UnPactoConDios.opus';
        opusSource.type = 'audio/opus';
        audioElement.appendChild(opusSource);
        const aacSource = document.createElement('source');
        aacSource.src = '/music/UnPactoConDios.aac';
        aacSource.type = 'audio/aac';
        audioElement.appendChild(aacSource);
        const mp3Source = document.createElement('source');
        mp3Source.src = '/music/UnPactoConDios.mp3';
        mp3Source.type = 'audio/mpeg';
        audioElement.appendChild(mp3Source);
        audioElement.appendChild(document.createTextNode('Tu navegador no soporta el elemento de audio.'));
        audioRef.current = audioElement;

        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);
        audioElement.addEventListener('ended', handleEnded);
        audioElement.addEventListener('error', handleError);

        // Attempt Autoplay
        try {
          await audioElement.play();
          console.log("Autoplay initiated.");
          if (isMounted) setIsPlaying(true);
        } catch (error) {
          console.log("Autoplay prevented by browser:", error);
          if (isMounted) setIsPlaying(false);
        }

      } catch (err) {
        console.error("Error in fetchData:", err);
        if (isMounted) {
          setError("Error al cargar los datos de la invitación.");
          setIsPlaying(false); // Ensure playing state is false on error
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        const currentAudio = audioRef.current;
        currentAudio.removeEventListener('play', handlePlay);
        currentAudio.removeEventListener('pause', handlePause);
        currentAudio.removeEventListener('ended', handleEnded);
        currentAudio.removeEventListener('error', handleError);
        if (!currentAudio.paused) {
          currentAudio.pause();
        }
        while (currentAudio.firstChild) {
          currentAudio.removeChild(currentAudio.firstChild);
        }
        currentAudio.load();
      }
      audioRef.current = null;
    };
  }, [invitationId]); // Re-run when invitationId changes


  const togglePlayPause = () => {
    if (!audioRef.current) return;
    const currentAudio = audioRef.current;
    if (currentAudio.paused) {
      currentAudio.play().catch(error => {
        console.error("Audio playback failed on toggle:", error);
      });
    } else {
      currentAudio.pause();
    }
  };

  const handleConfirmation = async (guests: string[], rejected: boolean) => {
     if (!invitationId) {
        console.error("Cannot submit confirmation without a valid invitation ID.");
        setError("Error: ID de invitación no válido.");
        return;
     }
     setIsLoading(true); // Indicate submission process
     setError(null);
     try {
        await submitConfirmation(invitationId, { guests, rejected });
        console.log("Confirmation submitted successfully:", { guests, rejected });

        // Update local state to immediately reflect the change
        setConfirmedGuests(guests);
        setIsRejected(rejected);
        // Update the main invitation data state as well
        setInvitationData(prevData => prevData ? ({
            ...prevData,
            Confirmado: true,
            PasesConfirmados: rejected ? 0 : guests.length,
            Asistentes: guests
        }) : null);

     } catch (error) {
         console.error("Failed to submit confirmation:", error);
         setError("Error al enviar la confirmación. Inténtalo de nuevo.");
     } finally {
       setIsLoading(false);
     }
  };

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
                />
           </div>
            <div className={cn(
                "relative z-10 flex flex-col items-center text-center text-white w-full h-full py-8 md:py-12 px-4",
                isPortrait ? "justify-between" : "justify-end"
            )}>
                 <div className={cn("flex flex-col items-center space-y-4 md:space-y-6", isPortrait ? "mt-4" : "mb-4")}>
                     <h1 className={cn(
                         "text-6xl font-julietta text-white select-none leading-none [text-shadow:0_0_15px_rgba(0,0,0,0.9)] w-[90%] max-w-full", // Increased shadow, explicit white
                         !isPortrait && "opacity-50"
                     )}>
                         SilviOscar
                    </h1>
                 </div>
                 <AnimatedSection animationType="fade" className="delay-500 mb-4">
                    <h2 className={cn(
                        "text-4xl font-julietta text-white [text-shadow:0_0_15px_rgba(0,0,0,1)]", // Increased shadow, explicit white
                         !isPortrait && "opacity-50"
                    )}>
                         ¡Nos casamos!
                    </h2>
                 </AnimatedSection>
            </div>
       </header>
   );

   if (isLoading) {
     return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
   }

   // Render error / not found message if applicable
   if (error || !invitationData) {
       return (
            <div className="min-h-screen text-foreground overflow-x-hidden">
                {renderHeader()}
                <div className="flex flex-col items-center justify-center text-center p-4 mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Invitación no encontrada</h2>
                    <p className="text-muted-foreground">{error || "Por favor, verifica el enlace o contacta a los novios."}</p>
                </div>
            </div>
       );
   }

    // Main content render now assumes invitationData is available
    const isAlreadyConfirmed = invitationData.Confirmado;


  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      {renderHeader()}
      <main className="px-4 md:px-8 py-12 space-y-12 md:space-y-16">

           <AnimatedSection animationType="fade" className="text-center mb-12">
               <div className="space-y-2 md:space-y-3">
                    <p className="text-xl md:text-2xl">Sábado</p>
                    <div className="inline-block bg-primary/80 text-primary-foreground rounded-lg p-3 md:p-4 shadow-md">
                        <div className="text-5xl md:text-6xl font-bold">26</div>
                        <div className="text-lg md:text-xl">julio</div>
                    </div>
                    <p className="text-xl md:text-2xl mt-1 md:mt-2">2025</p>
                </div>
           </AnimatedSection>

           <AnimatedSection animationType="slideInRight">
              <Card className="shadow-lg border-none bg-secondary/10 p-6 md:p-8 rounded-lg">
                  <CardContent className="pt-6">
                  <p className="text-lg md:text-xl text-center italic">
                      "Todos los días juntos son días maravillosos y queremos que nos acompañen en el más importante para nosotros."
                  </p>
                  </CardContent>
              </Card>
           </AnimatedSection>

          <Separator className="my-8 md:my-12" />

          <div className="grid grid-cols-1 gap-8 items-center">
             <AnimatedSection animationType="slideInLeft" className="flex flex-col items-center space-y-4">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">Música de Fondo</h3>
                  <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-16 w-16 border-2 border-primary hover:bg-primary/10"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
                  >
                   {isPlaying ? <Volume2 className="h-8 w-8 text-primary" /> : <VolumeX className="h-8 w-8 text-muted-foreground" />}
                  </Button>
                   {!isPlaying && (
                     <p className="text-xs text-muted-foreground text-center max-w-xs">
                       Es posible que necesites presionar el botón para iniciar la música en algunos dispositivos.
                     </p>
                   )}
              </AnimatedSection>

              <AnimatedSection animationType="slideInRight" className="text-center">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">Sólo Faltan</h3>
                  <Countdown targetDate={weddingDate} />
              </AnimatedSection>
          </div>

          <Separator className="my-8 md:my-12" />

          <AnimatedSection animationType="fade">
              <h3 className="text-5xl font-julietta text-center mb-6 text-primary">uestros momento</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                  {/* Row 1 */}
                  <AnimatedSection animationType="slideInLeft" className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src="/images/mosaic/M1.jpg"
                          alt="Oscar y Silvia Mosaico 1"
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          data-ai-hint="pareja abrazados playa"
                      />
                  </AnimatedSection>
                  <AnimatedSection animationType="slideInRight" className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                           src="/images/mosaic/M2.jpg"
                           alt="Oscar y Silvia Mosaico 2"
                           fill
                           style={{ objectFit: "cover" }}
                           className="animate-zoom-loop-short"
                           sizes="(max-width: 768px) 50vw, 33vw"
                           data-ai-hint="pareja sonriendo parque"
                      />
                  </AnimatedSection>
                  <AnimatedSection animationType="fade" className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src="/images/mosaic/M3.jpg"
                          alt="Oscar y Silvia Mosaico 3"
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                           sizes="(max-width: 768px) 100vw, 66vw"
                           data-ai-hint="pareja caminando ciudad"
                      />
                  </AnimatedSection>
                  <AnimatedSection animationType="slideInLeft" className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src="/images/mosaic/M4.jpg"
                          alt="Oscar y Silvia Mosaico 4"
                          fill
                           style={{ objectFit: "cover", objectPosition: "top" }}
                          className="animate-zoom-loop-short"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          data-ai-hint="pareja riendo atardecer"
                      />
                  </AnimatedSection>
                  <AnimatedSection animationType="slideInRight" className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src="/images/mosaic/M5.jpg"
                          alt="Oscar y Silvia Mosaico 5"
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                           sizes="(max-width: 768px) 50vw, 33vw"
                           data-ai-hint="detalle manos anillos"
                      />
                  </AnimatedSection>
              </div>
          </AnimatedSection>

          <Separator className="my-8 md:my-12" />

          <div className="grid grid-cols-1 gap-8">
              <AnimatedSection animationType="slideInLeft" className="text-center">
                  <h3 className="text-5xl font-julietta mb-4 text-primary">uestros Padre</h3>
                  <div className="space-y-2 text-lg">
                  {padres.map((nombre, index) => (
                      <p key={index}>{nombre}</p>
                  ))}
                  </div>
               </AnimatedSection>

              <AnimatedSection animationType="slideInRight" className="text-center">
                  <h3 className="text-5xl font-julietta mb-4 text-primary">uestros Padrino</h3>
                   <div className="space-y-4">
                        {padrinos.map((padrino, index) => (
                             <PadrinoItem key={index} icon={padrino.icon} names={padrino.names} role={padrino.role} />
                        ))}
                   </div>
               </AnimatedSection>
          </div>

          <Separator className="my-8 md:my-12" />

           <AnimatedSection animationType="fade">
              <h3 className="text-5xl font-julietta text-center mb-6 text-primary">tinerari</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {itinerary.map((item, index) => (
                       <ItineraryItem key={index} icon={item.icon} time={item.time} description={item.description} />
                  ))}
              </div>
          </AnimatedSection>

          <Separator className="my-8 md:my-12" />

           <AnimatedSection animationType="slideInUp">
              <Card className="text-center shadow-lg border-none bg-secondary/10 p-6 md:p-8 rounded-lg">
                   <CardHeader>
                      <CardTitle className="text-3xl md:text-4xl font-semibold flex items-center justify-center gap-2">
                          <MapPin className="h-8 w-8 text-primary" />
                          Ubicación - Jardín Margaty
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                      <p className="text-lg">{locationAddress}</p>
                       <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                               Abrir en GPS
                          </a>
                       </Button>
                  </CardContent>
              </Card>
           </AnimatedSection>

          <Separator className="my-8 md:my-12" />

           <AnimatedSection animationType="fade">
               <h3 className="text-4xl font-julietta text-center mb-6 text-primary">onfirma  tu  asistenci</h3>

                {/* Display Invitation Name and Assigned Passes */}
                <div className="text-center mb-4">
                     <p className="text-lg text-muted-foreground">Invitación para:</p>
                     <p className="text-2xl font-semibold text-foreground">{invitationName}</p>
                     <p className="text-sm text-muted-foreground mt-1">{assignedPasses === 1 ? '1 Pase Asignado' : `${assignedPasses} Pases Asignados`}</p>
                </div>

               {/* Confirmation Status/Form */}
               {isAlreadyConfirmed ? ( // Check if already confirmed (based on DB initially)
                    isRejected ? ( // Check if confirmation was a rejection
                        <Card className="bg-muted/50 p-6 rounded-lg shadow">
                            <CardContent className="flex items-center gap-4 pt-6">
                            <XCircle className="h-8 w-8 text-destructive" />
                            <p className="text-muted-foreground">Lamentamos no poder contar con tu presencia y agradecemos mucho tu respuesta.</p>
                            </CardContent>
                        </Card>
                    ) : ( // Confirmed attendance
                        <Card className="bg-secondary/10 p-6 rounded-lg shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                                <CheckCircle className="h-6 w-6" />
                                ¡Confirmación Recibida!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="mb-4">Gracias por confirmar. Has reservado lugar para:</p>
                                {confirmedGuests.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {confirmedGuests.map((guest, index) => (
                                            <li key={index}>{guest}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="italic text-muted-foreground">(No se registraron nombres)</p> // Should ideally not happen if PasesConfirmados > 0
                                )}

                            </CardContent>
                        </Card>
                    )
                ) : ( // Not yet confirmed, show the form
                   <ConfirmationForm
                      invitationId={invitationId ?? ''} // Pass the ID to the form
                      assignedPasses={assignedPasses}
                      onConfirm={handleConfirmation}
                      isLoading={isLoading} // Pass loading state for disabling during submission
                   />
               )}

               {/* Display submission error if any */}
               {error && !isLoading && ( // Show error only if not currently loading
                   <p className="text-center text-destructive mt-4">{error}</p>
               )}

          </AnimatedSection>

        </main>


      <footer className="text-center py-8 bg-muted/50 mt-12">
          <p className="text-muted-foreground">Silvia &amp; Oscar - 26 julio 2025</p>
      </footer>
    </div>
  );
}

// Wrap the main component with Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Cargando invitación...</div>}>
      <InvitationPageContent />
    </Suspense>
  );
}
