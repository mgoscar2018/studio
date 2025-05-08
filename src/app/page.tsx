// src/app/page.tsx
'use client';

import type React from 'react';
import { useState, useEffect, useRef, Suspense } from 'react'; // Import Suspense
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// Updated Lucide imports - removed BookOpen, Gem, Diamond, HandHeart
import { MapPin, CalendarDays, Clock, Music, Users, CheckCircle, XCircle, Volume2, VolumeX, Heart } from 'lucide-react'; 
// Import new react-icons
import { FaBible } from 'react-icons/fa';
import { PiHandCoins } from 'react-icons/pi';
import { GiLinkedRings, GiPillow } from 'react-icons/gi'; // GiPillow was already here, added GiLinkedRings
import { IoDiamond } from 'react-icons/io5'; // Added IoDiamond

import Countdown from '@/components/invitation/Countdown';
import PadrinoItem from '@/components/invitation/PadrinoItem';
import ConfirmationForm from '@/components/invitation/ConfirmationForm';
import AnimatedSection from '@/components/invitation/AnimatedSection';
import TimelineItinerary from '@/components/invitation/TimelineItinerary'; // Import new TimelineItinerary
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

// Updated padrinos array with new icons
const padrinos = [
  { icon: FaBible, names: "Ricardo Garcia & Adriana Sotelo", role: "Padrinos de Biblia" },
  { icon: IoDiamond, names: "Tomás Castillo & Aracely Ortega", role: "Padrinos de Anillos" },
  { icon: PiHandCoins, names: "Roberto de León & Claudia Valencia", role: "Padrinos de Arras" },
  { icon: GiLinkedRings, names: "Polly Lagunas & Minerva Gongora", role: "Padrinos de Lazo" },
  { icon: GiPillow, names: "Luis Luviano & Carmen Castrejón", role: "Padrinos de Cojines" },
];

const itinerary = [
  { icon: CalendarDays, time: "2:00 p.m.", description: "Ceremonia" },
  { icon: Clock, time: "3:00 p.m.", description: "Cóctel de Bienvenida" },
  { icon: Users, time: "4:30 p.m.", description: "Banquete" },
  { icon: Music, time: "5:30 p.m.", description: "Bailes Oficiales" },
  { icon: Music, time: "6:00 p.m.", description: "Inicia la Fiesta" },
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Separate state for submission loading

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State derived from invitationData - used to control form/confirmation display
  const [confirmedGuests, setConfirmedGuests] = useState<string[]>([]);
  const [isRejected, setIsRejected] = useState<boolean>(false);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState<boolean>(false); // Track initial confirmed state

  // Other state from invitationData
  const [assignedPasses, setAssignedPasses] = useState<number>(0);
  const [invitationName, setInvitationName] = useState<string>('');
  const [groomName, setGroomName] = useState<string>('Novio'); // Default placeholder
  const [brideName, setBrideName] = useState<string>('Novia'); // Default placeholder

  // Update invitationId if URL changes
  useEffect(() => {
    const newId = searchParams.get('id');
    if (newId !== invitationId) {
      setInvitationId(newId);
      // Reset states when ID changes
      setInvitationData(null);
      setIsLoading(true);
      setError(null);
      setIsPlaying(false);
      setConfirmedGuests([]);
      setIsRejected(false);
      setIsAlreadyConfirmed(false);
      setAssignedPasses(0);
      setInvitationName('');
    }
  }, [searchParams, invitationId]);

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
      setError("Por favor, verifica el enlace o contacta a los novios."); // Updated error message
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
          setInvitationData(null); // Explicitly set to null
           setIsLoading(false);
           // Update confirmation states as well
           setIsAlreadyConfirmed(false);
           setIsRejected(false);
           setConfirmedGuests([]);
           setAssignedPasses(0);
           setInvitationName('');
          return; // Stop further processing
        }

        console.log("Invitation data fetched successfully:", data);
        setInvitationData(data); // Set the full fetched data

        // Update state based on fetched data
        setInvitationName(data.Nombre || 'Invitado/a');
        setAssignedPasses(data.PasesAsignados || 0);

        // Set confirmation status based *directly* on fetched data
        setIsAlreadyConfirmed(data.Confirmado);
        // Set rejection status only if confirmed AND confirmed passes are 0
        setIsRejected(data.Confirmado && data.PasesConfirmados === 0);
        setConfirmedGuests(data.Asistentes || []);


        // Set Groom/Bride names
        setGroomName('Oscar'); // Keeping static for now
        setBrideName('Silvia'); // Keeping static for now


        // Setup Audio Element only if not already created and invitation is valid
        if (!audioRef.current && data) {
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
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Autoplay initiated.");
                    if (isMounted) setIsPlaying(true);
                }).catch(error => {
                    console.log("Autoplay prevented by browser:", error);
                     if (isMounted) {
                         setIsPlaying(false);
                         // Add a user interaction hint if autoplay fails
                         // e.g., display a message "Click the play button to start music"
                     }
                });
            }
        }

      } catch (err) {
        console.error("Error in fetchData:", err);
        if (isMounted) {
          setError("Error al cargar los datos de la invitación.");
          setInvitationData(null); // Ensure data is null on error
          setIsPlaying(false); // Ensure playing state is false on error
           // Reset confirmation states on error too
           setIsAlreadyConfirmed(false);
           setIsRejected(false);
           setConfirmedGuests([]);
           setAssignedPasses(0);
           setInvitationName('');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      // Don't destroy the audio element here, only remove listeners
      // This prevents re-creation on every state change
      const currentAudio = audioRef.current;
      if (currentAudio) {
        currentAudio.removeEventListener('play', handlePlay);
        currentAudio.removeEventListener('pause', handlePause);
        currentAudio.removeEventListener('ended', handleEnded);
        currentAudio.removeEventListener('error', handleError);
        // Don't pause or reset src here if we want it to persist across renders
      }
      // No need to set audioRef.current = null here if we want it to persist
    };
  }, [invitationId]); // Re-run ONLY when invitationId changes


  const togglePlayPause = () => {
    if (!audioRef.current) return;
    const currentAudio = audioRef.current;
    if (currentAudio.paused) {
      currentAudio.play().catch(error => {
        console.error("Audio playback failed on toggle:", error);
        // Maybe show a toast to the user if play fails
      });
    } else {
      currentAudio.pause();
    }
    // State update (isPlaying) is handled by the event listeners ('play', 'pause')
  };

  const handleConfirmation = async (guests: string[], rejected: boolean) => {
     if (!invitationId) {
        console.error("Cannot submit confirmation without a valid invitation ID.");
        setError("Error: ID de invitación no válido.");
        return; // Early return if no ID
     }
     setIsSubmitting(true); // Use separate submitting state
     setError(null); // Clear previous errors
     try {
        await submitConfirmation(invitationId, { guests, rejected });
        console.log("Confirmation submitted successfully:", { guests, rejected });

        // Update local state immediately to reflect the change WITHOUT re-fetching
        setIsAlreadyConfirmed(true); // Mark as confirmed
        setIsRejected(rejected); // Set rejection status
        setConfirmedGuests(guests); // Update guest list
        // Update the PasesConfirmados in the main data state if needed, though it's less critical
        // as we are primarily using the derived states (isAlreadyConfirmed, isRejected, confirmedGuests)
        // for display logic after submission.
        // IMPORTANT: Also update PasesConfirmados in the main data state
        setInvitationData(prevData => prevData ? ({
            ...prevData,
            Confirmado: true,
            PasesConfirmados: rejected ? 0 : guests.length, // Update this value
            Asistentes: guests
        }) : null);


     } catch (error) {
         console.error("Failed to submit confirmation:", error);
         setError("Error al enviar la confirmación. Inténtalo de nuevo.");
         // Revert optimistic updates might be needed here if the submission fails,
         // but for simplicity, we'll rely on the user retrying or a potential refresh.
         // For a more robust solution, store the previous state and revert on error.
     } finally {
       setIsSubmitting(false); // Stop submitting indicator
     }
  };

   const renderHeader = () => (
       <header className="relative h-[70vh] w-full overflow-hidden flex flex-col items-center">
           <div className="absolute inset-0 z-0">
                <Image
                  // Use different images based on orientation
                  src={isPortrait ? "/images/Portada_2.jpeg" : "/images/Portada_h.jpg"}
                  alt="Portada de Boda Oscar y Silvia"
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={90}
                  priority
                  className="animate-zoom-loop" // Apply zoom loop animation
                />
           </div>
            <div className={cn(
                "relative z-10 flex flex-col items-center text-center text-white w-full h-full py-8 md:py-12 px-4",
                // Adjust layout based on orientation
                 isPortrait ? "justify-between" : "justify-end pb-8" // Add padding-bottom in landscape
            )}>
                 {/* Names Container */}
                 <div className={cn(
                      "flex flex-col items-center w-[90%] max-w-full", // Use 90% width
                      isPortrait ? "mt-4" : "mb-auto" // Push names to top in portrait, bottom in landscape (implicitly via justify-end parent)
                 )}>
                     <h1 className={cn(
                         "font-julietta text-white select-none leading-none [text-shadow:0_0_15px_rgba(0,0,0,1)]", // Increased shadow, explicit white
                         "text-7xl", // Fixed font size
                         !isPortrait && "opacity-50" // Dim in landscape
                     )}>
                         SilviOscar
                    </h1>
                 </div>
                {/* "Nos Casamos" Container */}
                <AnimatedSection animationType="fade" className={cn(
                    "delay-500",
                    isPortrait ? "mb-4" : "mt-auto w-full" // Bottom in portrait, take full width and push up in landscape
                )}>
                    <h2 className={cn(
                        "text-4xl font-julietta text-white [text-shadow:0_0_15px_rgba(0,0,0,1)]", // Increased shadow, explicit white
                         !isPortrait && "opacity-50" // Dim in landscape
                    )}>
                         ¡Nos casamos!
                    </h2>
                </AnimatedSection>
            </div>
       </header>
   );

   // Initial Loading State
   if (isLoading && !invitationData && !error) { // Show loading only on initial load
     return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
   }

   // Render error / not found message if applicable AFTER initial load attempt
   if (error || (!isLoading && !invitationData)) { // Check !isLoading here
       return (
            <div className="min-h-screen text-foreground overflow-x-hidden">
                {renderHeader()} {/* Still show header */}
                <div className="flex flex-col items-center justify-center text-center p-4 mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Invitación no encontrada</h2>
                    <p className="text-muted-foreground">{error || "Por favor, verifica el enlace o contacta a los novios."}</p>
                </div>
            </div>
       );
   }

   // Main content render now assumes invitationData is available (or was attempted)
   // We use the derived states `isAlreadyConfirmed` and `isRejected` for the confirmation section logic


  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      {renderHeader()}
      <main className="px-4 md:px-6 py-10 space-y-10 md:space-y-12"> {/* Reduced padding/spacing */}

           <AnimatedSection animationType="fade" className="text-center mb-10">
               <div className="space-y-1 md:space-y-2"> {/* Reduced spacing */}
                    <p className="text-lg md:text-xl">Sábado</p> {/* Reduced text size */}
                    <div className="inline-block bg-primary/80 text-primary-foreground rounded-lg p-2 md:p-3 shadow-md"> {/* Reduced padding */}
                        <div className="text-4xl md:text-5xl font-bold">26</div> {/* Reduced text size */}
                        <div className="text-base md:text-lg">julio</div> {/* Reduced text size */}
                    </div>
                    <p className="text-lg md:text-xl mt-1">2025</p> {/* Reduced text size */}
                </div>
           </AnimatedSection>

           <AnimatedSection animationType="slideInRight">
              <Card className="shadow-lg border-none bg-secondary/10 p-4 md:p-6 rounded-lg"> {/* Reduced padding */}
                  <CardContent className="pt-4"> {/* Adjusted padding top */}
                  <p className="text-base md:text-lg text-center italic"> {/* Reduced text size */}
                      "Todos los días juntos son días maravillosos y queremos que nos acompañen en el más importante para nosotros."
                  </p>
                  </CardContent>
              </Card>
           </AnimatedSection>

          <Separator className="my-6 md:my-8" /> {/* Reduced margin */}

          <div className="grid grid-cols-1 gap-6"> {/* Reduced gap */}
             <AnimatedSection animationType="slideInLeft" className="flex flex-col items-center space-y-3"> {/* Reduced spacing */}
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Música de Fondo</h3> {/* Reduced text size and margin */}
                  <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-14 w-14 border-2 border-primary hover:bg-primary/10" // Slightly smaller
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
                  >
                   {isPlaying ? <Volume2 className="h-7 w-7 text-primary" /> : <VolumeX className="h-7 w-7 text-muted-foreground" />} {/* Slightly smaller icons */}
                  </Button>
                   {!isPlaying && !isLoading && audioRef.current?.paused && ( // Show hint only if paused and not loading
                     <p className="text-xs text-muted-foreground text-center max-w-xs">
                       Haz clic para iniciar la música.
                     </p>
                   )}
              </AnimatedSection>

              <AnimatedSection animationType="slideInRight" className="text-center">
                  <h3 className="text-xl md:text-2xl font-semibold mb-3">Sólo Faltan</h3> {/* Reduced text size and margin */}
                  <Countdown targetDate={weddingDate} />
              </AnimatedSection>
          </div>

          <Separator className="my-6 md:my-8" /> {/* Reduced margin */}

          <AnimatedSection animationType="fade">
              <h3 className="text-4xl font-julietta text-center mb-4 text-primary">uestros momento</h3> {/* Reduced margin */}
              <div className="grid grid-cols-2 gap-2 md:gap-3"> {/* Reduced gap */}
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
                           src="/images/mosaic/M6.jpg"
                           alt="Oscar y Silvia Mosaico 2"
                           fill
                           style={{ objectFit: "cover" }}
                           className="animate-zoom-loop-short"
                           sizes="(max-width: 768px) 50vw, 33vw"
                           data-ai-hint="pareja sonriendo parque"
                      />
                  </AnimatedSection>
                  {/* Row 2 */}
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
                   {/* Row 3 */}
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

          <Separator className="my-6 md:my-8" /> {/* Reduced margin */}

          <div className="grid grid-cols-1 gap-6"> {/* Reduced gap */}
              <AnimatedSection animationType="slideInLeft" className="text-center">
                  <h3 className="text-4xl font-julietta mb-3 text-primary">uestros Padre</h3> {/* Reduced margin */}
                  <div className="space-y-1 text-base md:text-lg"> {/* Reduced spacing and text size */}
                  {padres.map((nombre, index) => (
                      <p key={index}>{nombre}</p>
                  ))}
                  </div>
               </AnimatedSection>

              <AnimatedSection animationType="slideInRight" className="text-center">
                  <h3 className="text-4xl font-julietta mb-3 text-primary">uestros Padrino</h3> {/* Reduced margin */}
                   <div className="space-y-3"> {/* Reduced spacing */}
                        {padrinos.map((padrino, index) => (
                             <PadrinoItem key={index} icon={padrino.icon} names={padrino.names} role={padrino.role} />
                        ))}
                   </div>
               </AnimatedSection>
          </div>

          <Separator className="my-6 md:my-8" /> {/* Reduced margin */}

           <AnimatedSection animationType="fade">
              <h3 className="text-4xl font-julietta text-center mb-4 text-primary">tinerari</h3> {/* Reduced margin */}
              <TimelineItinerary items={itinerary} />
          </AnimatedSection>

          <Separator className="my-6 md:my-8" /> {/* Reduced margin */}

           <AnimatedSection animationType="slideInUp">
              <Card className="text-center shadow-lg border-none bg-secondary/10 p-4 md:p-6 rounded-lg"> {/* Reduced padding */}
                   <CardHeader className="p-0 pb-2"> {/* Removed padding */}
                      <CardTitle className="text-2xl md:text-3xl font-semibold flex items-center justify-center gap-2"> {/* Reduced text size */}
                          <MapPin className="h-6 w-6 md:h-7 md:w-7 text-primary" /> {/* Reduced icon size */}
                          Ubicación - Jardín Margaty
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4"> {/* Reduced spacing */}
                      <p className="text-base md:text-lg">{locationAddress}</p> {/* Reduced text size */}
                       <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                               Abrir en GPS
                          </a>
                       </Button>
                  </CardContent>
              </Card>
           </AnimatedSection>

          <Separator className="my-6 md:my-8" /> {/* Reduced margin */}

           <AnimatedSection animationType="fade">
               <h3 className="text-4xl font-julietta text-center mb-4 text-primary">onfirma  tu  asistenci</h3> {/* Reduced margin */}

                {/* Display Invitation Name */}
                <div className="text-center mb-4">
                     <p className="text-sm text-muted-foreground">Invitación para:</p> {/* Reduced text size */}
                     {/* Updated invitation name style - Removed font-julietta */}
                     <p className="text-3xl font-semibold text-foreground">{invitationName || "Invitado/a"}</p> {/* Reduced to 3xl */}

                     {/* Conditionally display pass count */}
                     {!isAlreadyConfirmed && ( // Show ASSIGNED passes ONLY if NOT confirmed yet
                         <p className="text-xs text-muted-foreground mt-1">{assignedPasses === 1 ? '1 Pase Asignado' : `${assignedPasses} Pases Asignados`}</p>
                     )}
                     {isAlreadyConfirmed && !isRejected && invitationData?.PasesConfirmados !== undefined && invitationData.PasesConfirmados > 0 && ( // Show CONFIRMED passes if confirmed and NOT rejected AND > 0
                        <p className="text-xs text-muted-foreground mt-1">{invitationData.PasesConfirmados === 1 ? '1 Pase Confirmado' : `${invitationData.PasesConfirmados} Pases Confirmados`}</p>
                     )}
                     {/* If rejected (isAlreadyConfirmed is true and isRejected is true), no pass count is shown */}

                </div>

               {/* Confirmation Status/Form */}
               {isAlreadyConfirmed ? ( // Use state derived from DB
                    isRejected ? ( // Use state derived from DB
                        <Card className="bg-muted/50 p-4 rounded-lg shadow"> {/* Reduced padding */}
                            <CardContent className="flex items-center gap-3 pt-4"> {/* Reduced gap, adjusted padding */}
                            <XCircle className="h-6 w-6 md:h-7 md:w-7 text-destructive" /> {/* Reduced icon size */}
                            <p className="text-sm md:text-base text-muted-foreground">Lamentamos no poder contar con tu presencia y agradecemos mucho tu respuesta, ya que con ello podremos organizar óptimamente los lugares.</p> {/* Reduced text size and updated message */}
                            </CardContent>
                        </Card>
                    ) : ( // Confirmed attendance
                        <Card className="bg-secondary/10 p-4 rounded-lg shadow"> {/* Reduced padding */}
                            <CardHeader className="p-0 pb-2"> {/* Removed padding */}
                                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-primary"> {/* Reduced text size */}
                                <CheckCircle className="h-5 w-5 md:h-6 md:w-6" /> {/* Reduced icon size */}
                                ¡Confirmación Recibida!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4"> {/* Adjusted padding top */}
                                <p className="mb-3 text-sm md:text-base">Gracias por confirmar. Has reservado lugar para:</p> {/* Reduced margin and text size */}
                                {confirmedGuests.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1 text-sm md:text-base"> {/* Reduced spacing and text size */}
                                        {confirmedGuests.map((guest, index) => (
                                            <li key={index}>{guest}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="italic text-muted-foreground text-sm md:text-base">(No se registraron nombres)</p> // Should ideally not happen if PasesConfirmados > 0
                                )}

                            </CardContent>
                        </Card>
                    )
                ) : ( // Not yet confirmed, show the form
                   <ConfirmationForm
                      invitationId={invitationId ?? ''} // Pass the ID to the form
                      assignedPasses={assignedPasses}
                      onConfirm={handleConfirmation}
                      isLoading={isSubmitting} // Pass submission loading state
                   />
               )}

               {/* Display submission error if any */}
               {error && !isSubmitting && ( // Show error only if not currently submitting
                   <p className="text-center text-destructive mt-3 text-sm">{error}</p> // Reduced margin/text size
               )}

          </AnimatedSection>

        </main>


      <footer className="text-center py-6 bg-muted/50 mt-10"> {/* Reduced padding/margin */}
          <p className="text-muted-foreground text-sm">Silvia &amp; Oscar - 26 julio 2025</p> {/* Reduced text size */}
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

