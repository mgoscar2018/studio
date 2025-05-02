// src/app/page.tsx
'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react'; // Import useRef
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// Replaced Ring with Gem as Ring does not exist in lucide-react
// Added Sofa icon for cojines
import { Play, BookOpen, Gem, Diamond, HandHeart, MapPin, CalendarDays, Clock, Music, Users, CheckCircle, XCircle, Volume2, VolumeX, Sofa } from 'lucide-react'; // Added Volume icons and Sofa
import Countdown from '@/components/invitation/Countdown';
import ItineraryItem from '@/components/invitation/ItineraryItem';
import PadrinoItem from '@/components/invitation/PadrinoItem';
import ConfirmationForm from '@/components/invitation/ConfirmationForm';
import AnimatedSection from '@/components/invitation/AnimatedSection';
// Mock function, replace with actual data fetching
// Import functions for data fetching
import { getConfirmation, submitConfirmation, getAssignedPasses } from '@/services/music';


// Placeholder data - Replace with actual data fetching logic
const invitationId = 'unique-invitation-id'; // Example ID, should come from URL params or props
// Wedding date with Mexico City timezone offset (GMT-6)
const weddingDate = new Date('2025-07-26T14:00:00-06:00');
const groomName = "Oscar"; // Replace with actual groom name
const brideName = "Silvia"; // Replace with actual bride name

// Updated photos array to use local images from /public/images/carousel
// Ensure files Foto_1.jpg, Foto_2.jpg, etc. exist in public/images/carousel/
const photos = [
  { src: "/images/carousel/Foto_1.jpg", alt: "Oscar y Silvia Foto 1" },
  { src: "/images/carousel/Foto_2.jpg", alt: "Oscar y Silvia Foto 2" },
  { src: "/images/carousel/Foto_3.jpg", alt: "Oscar y Silvia Foto 3" },
  { src: "/images/carousel/Foto_4.jpg", alt: "Oscar y Silvia Foto 4" },
  { src: "/images/carousel/Foto_5.jpg", alt: "Oscar y Silvia Foto 5" },
];

const padres = [
  "MA. ARELI GONGORA OCAMPO",
  "SILVIANO GARCIA AYALA",
  "ELIA GOMEZ MORENO",
  "MARIO MIRANDA SALGADO"
];

const padrinos = [
  { icon: BookOpen, names: "Ricardo Garcia & Adriana Sotelo", role: "Padrinos de Biblia" },
  { icon: Gem, names: "Lorena & Eduardo", role: "Padrinos de Anillos" }, // Changed Ring to Gem
  { icon: Diamond, names: "Roberto de León & Claudia Valencia", role: "Padrinos de Arras" },
  { icon: HandHeart, names: "Polly Lagunas & Minerva Gongora", role: "Padrinos de Lazo" },
  { icon: Sofa, names: "Luis Luviano & Carmen Castrejón", role: "Padrinos de Cojines" }, // Added padrinos de cojines
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
  const [isPlaying, setIsPlaying] = useState(false); // State managed by audio events
  const [confirmedGuests, setConfirmedGuests] = useState<string[]>([]); // State for confirmed guests
  const [isRejected, setIsRejected] = useState<boolean>(false); // State for rejection status
  const [assignedPasses, setAssignedPasses] = useState<number>(0); // State for assigned passes
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to manage the audio element directly


  // Combined useEffect for fetching initial data and setting up audio
  useEffect(() => {
    let audioElement: HTMLAudioElement | null = null;
    let isMounted = true; // Flag to prevent state updates on unmounted component

    // Define handlers within useEffect scope so they can be added and removed
    const handlePlay = () => { if (isMounted) setIsPlaying(true); };
    const handlePause = () => { if (isMounted) setIsPlaying(false); };
    const handleEnded = () => {
      // Optional: Handle what happens when the audio finishes if loop is disabled
       if (isMounted) setIsPlaying(false);
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch confirmation and passes data
        const [confirmationData, passesData] = await Promise.all([
            getConfirmation(invitationId),
            getAssignedPasses(invitationId)
        ]);
        // Removed getNames call as it doesn't exist
        if (!isMounted) return; // Exit if component unmounted

        // Setup Audio Element with multiple sources
        audioElement = document.createElement('audio');
        audioElement.loop = true;

        // Create source elements for different formats
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

        // Fallback text if no source is supported
        audioElement.appendChild(document.createTextNode('Tu navegador no soporta el elemento de audio.'));

        audioRef.current = audioElement; // Assign the created element to the ref

        // Add event listeners BEFORE trying to play
        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);
        audioElement.addEventListener('ended', handleEnded); // Listen for ended event
         audioElement.addEventListener('error', (e) => {
             console.error("Audio Error:", e);
             // You could potentially try loading the next format manually here if needed,
             // but the browser should handle source fallback automatically.
         });

        // Set Confirmation Data
        if (confirmationData) {
            setConfirmedGuests(confirmationData.guests || []);
            setIsRejected(confirmationData.rejected || false);
        }

        // Set Assigned Passes
        setAssignedPasses(passesData);

        // Attempt Autoplay - Rely solely on events now to manage isPlaying state
        try {
            // NOTE: Autoplay with sound is often blocked by browsers (esp. mobile)
            // until user interaction. This attempt might fail silently or throw.
            // A user interaction might be required on some devices.
            await audioElement.play();
            // If successful, the 'play' event listener (handlePlay) will set isPlaying = true
             console.log("Autoplay initiated. Playback depends on browser policy.");
             // Explicitly set state if play() resolves without error
             if(isMounted) setIsPlaying(true);
        } catch (error) {
             // Autoplay failed or requires user interaction
             console.log("Autoplay prevented by browser:", error);
             // Ensure state is false if autoplay fails
             if(isMounted) setIsPlaying(false);
             // The UI should reflect the actual state via the isPlaying variable.
        }

      } catch (error) {
        console.error("Error fetching initial data or setting up audio:", error);
         // Ensure state is false on fetch error, as audio likely didn't load/play
         if (isMounted) setIsPlaying(false);
      } finally {
         if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    // Clean up audio element and listeners on unmount
    return () => {
      isMounted = false; // Mark as unmounted
      if (audioRef.current) {
        const currentAudio = audioRef.current;
        // Use the actual handler functions for removal
        currentAudio.removeEventListener('play', handlePlay);
        currentAudio.removeEventListener('pause', handlePause);
        currentAudio.removeEventListener('ended', handleEnded); // Remove ended listener
         currentAudio.removeEventListener('error', (e) => console.error("Cleaned up audio error listener")); // Remove error listener

        // Pause audio and release resources on cleanup
        if (!currentAudio.paused) {
          currentAudio.pause();
        }
        // Clear sources to potentially help garbage collection
        while (currentAudio.firstChild) {
           currentAudio.removeChild(currentAudio.firstChild);
        }
        currentAudio.load(); // Reset the media element
      }
       audioRef.current = null; // Clear the ref
    };
  }, [invitationId]); // Re-run only if invitationId changes


  const togglePlayPause = () => {
    if (!audioRef.current) return;

    const currentAudio = audioRef.current;

    // Check the actual paused state of the audio element
    if (currentAudio.paused) {
        // If it's paused, play it
        currentAudio.play().catch(error => {
            console.error("Audio playback failed on toggle:", error);
             // If play fails, the state should remain unchanged (likely false)
             // We rely on the 'play' event handler to update state if successful
        });
    } else {
       // If it's playing, pause it
       currentAudio.pause();
        // We rely on the 'pause' event handler to update state
    }
    // Let event listeners ('play'/'pause') update the isPlaying state accurately.
    // Avoid setting state directly here to prevent race conditions with events.
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
      {/* Portada Section - Height changed to 70vh */}
       <header className="relative h-[70vh] w-full overflow-hidden flex flex-col items-center">
           {/* Background Image with Mask */}
           <div className="absolute inset-0 z-0">
                <Image
                  src="/images/Portada_2.jpeg"
                  alt="Portada de Boda Oscar y Silvia"
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={90}
                  priority
                  className="animate-zoom-loop"
                />
                {/* Apply the torn paper mask */}
                <div
                    className="absolute inset-0"
                    style={{
                        maskImage: 'url(/images/mask-torn-paper.svg)',
                        maskSize: 'cover', // Adjust as needed ('cover', 'contain', '100% 100%')
                        maskRepeat: 'no-repeat',
                         maskPosition: 'bottom center', // Position the mask at the bottom
                        WebkitMaskImage: 'url(/images/mask-torn-paper.svg)', // For Safari compatibility
                        WebkitMaskSize: 'cover',
                        WebkitMaskRepeat: 'no-repeat',
                         WebkitMaskPosition: 'bottom center',
                        backgroundColor: 'hsl(var(--background))', // Match the page background
                    }}
                />
           </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-between text-center text-white w-full h-full py-8 md:py-12 px-4"> {/* Changed text-primary to text-white */}
                 {/* Names - Top */}
                 <div className="flex flex-col items-center space-y-4 md:space-y-6">
                    <h1 className="text-[min(18vw,10rem)] md:text-[min(15vw,12rem)] lg:text-[min(14vw,14rem)] xl:text-[min(12vw,16rem)] 2xl:text-[18rem] font-julietta opacity-90 select-none w-[85vw] leading-none [text-shadow:0_0_8px_rgba(0,0,0,0.7)]"> {/* Changed shadow to black */}
                        SilviOscar
                    </h1>
                 </div>

                 {/* "¡Nos casamos!" Section - Bottom */}
                 <AnimatedSection animationType="fade" className="delay-500">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-julietta [text-shadow:0_0_8px_rgba(0,0,0,0.7)]">¡Nos casamos!</h2> {/* Changed shadow to black */}
                 </AnimatedSection>
            </div>
       </header>


      {/* Constrain main content width on larger screens */}
      <div className="container mx-auto px-4 md:px-8 max-w-2xl"> {/* Added max-w-2xl */}
        <main className="py-12 md:py-16 space-y-16 md:space-y-24">

           {/* Date Section - Moved Outside Header */}
           <AnimatedSection animationType="fade" className="text-center mb-16">
               <div className="space-y-2 md:space-y-3">
                    <p className="text-xl md:text-2xl">Sábado</p>
                    <div className="inline-block bg-primary/80 text-primary-foreground rounded-lg p-3 md:p-4 shadow-md"> {/* Adjusted padding, slightly transparent bg */}
                        <div className="text-5xl md:text-6xl font-bold">26</div>
                        <div className="text-lg md:text-xl">julio</div>
                    </div>
                    <p className="text-xl md:text-2xl mt-1 md:mt-2">2025</p>
                </div>
           </AnimatedSection>


          {/* Mensaje de los Novios */}
           <AnimatedSection animationType="slideInRight">
              <Card className="shadow-lg border-none bg-secondary/10 p-6 md:p-8 rounded-lg">
                  <CardContent className="pt-6"> {/* Added pt-6 to CardContent for padding */}
                  <p className="text-lg md:text-xl text-center italic">
                      "Todos los días juntos son días maravillosos y queremos que nos acompañen en el más importante para nosotros."
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
                  {/* Inform user interaction might be needed */}
                   {!isPlaying && !isLoading && (
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

          <Separator className="my-12 md:my-16" />

          {/* Nuestros Momentos - Image Mosaic */}
          <AnimatedSection animationType="fade">
              <h3 className="text-5xl md:text-6xl font-julietta text-center mb-8 text-ring">uestros momento</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                  {/* Row 1 */}
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src={photos[0].src}
                          alt={photos[0].alt}
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                          sizes="(max-width: 768px) 50vw, 33vw"
                      />
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src={photos[1].src}
                          alt={photos[1].alt}
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                          sizes="(max-width: 768px) 50vw, 33vw"
                      />
                  </div>
                   {/* Row 2 - Full width */}
                  <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-lg shadow-lg"> {/* Adjust aspect ratio as needed */}
                      <Image
                          src={photos[2].src}
                          alt={photos[2].alt}
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                           sizes="(max-width: 768px) 100vw, 66vw"
                      />
                  </div>
                  {/* Row 3 */}
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src={photos[3].src}
                          alt={photos[3].alt}
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                          sizes="(max-width: 768px) 50vw, 33vw"
                      />
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                      <Image
                          src={photos[4].src}
                          alt={photos[4].alt}
                          fill
                          style={{ objectFit: "cover" }}
                          className="animate-zoom-loop-short"
                           sizes="(max-width: 768px) 50vw, 33vw"
                      />
                  </div>
              </div>
          </AnimatedSection>


          <Separator className="my-12 md:my-16" />

          {/* Padres y Padrinos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <AnimatedSection animationType="slideInLeft" className="text-center">
                  <h3 className="text-5xl md:text-6xl font-julietta mb-6 text-ring">uestros Padre</h3> {/* Applied juliette font */}
                  <div className="space-y-2 text-lg">
                  {padres.map((nombre, index) => (
                      <p key={index}>{nombre}</p>
                  ))}
                  </div>
               </AnimatedSection>

              <AnimatedSection animationType="slideInRight" className="text-center">
                  <h3 className="text-5xl md:text-6xl font-julietta mb-6 text-ring">uestros Padrino</h3> {/* Applied juliette font */}
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
              <h3 className="text-5xl md:text-6xl font-julietta text-center mb-8 text-ring">tinerari</h3> {/* Applied juliette font */}
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
                          Ubicación - Jardín Margaty {/* Updated Title */}
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6"> {/* Added pt-6 to CardContent for padding */}
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
               <h3 className="text-4xl md:text-5xl font-julietta text-center mb-8 text-ring">onfirma  tu  asistenci</h3> {/* Updated Confirmation title with glyphs */}

               {isRejected ? (
                  <Card className="bg-muted/50 p-6 rounded-lg shadow">
                    <CardContent className="flex items-center gap-4 pt-6"> {/* Added pt-6 to CardContent for padding */}
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
                        <CardContent className="pt-6"> {/* Added pt-6 to CardContent for padding */}
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
      </div> {/* Close max-w-2xl container */}

      <footer className="text-center py-8 bg-muted/50 mt-16">
          {/* Updated Footer Text */}
          <p className="text-muted-foreground">Silvia &amp; Oscar - 26 julio 2025</p>
      </footer>
    </div>
  );
}
