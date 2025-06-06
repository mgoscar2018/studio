// src/app/page.tsx
'use client';

import type React from 'react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Music, CheckCircle, XCircle, Volume2, VolumeX } from 'lucide-react';
import { FaBible } from 'react-icons/fa';
import { PiHandCoins } from 'react-icons/pi';
import { GiLinkedRings, GiPillow, GiPartyPopper } from 'react-icons/gi';
import { IoDiamond } from 'react-icons/io5';
import { MdChurch } from 'react-icons/md';
import { LiaCocktailSolid } from 'react-icons/lia';
import { IoIosRestaurant } from 'react-icons/io';

import Countdown from '@/components/invitation/Countdown';
import PadrinoItem from '@/components/invitation/PadrinoItem';
import ConfirmationForm from '@/components/invitation/ConfirmationForm';
import AnimatedSection from '@/components/invitation/AnimatedSection';
import TimelineItinerary from '@/components/invitation/TimelineItinerary';
import { getInvitationData, submitConfirmation, type InvitationData } from '@/services/invitation';
import { cn } from '@/lib/utils';

const weddingDate = new Date('2025-07-26T14:00:00-06:00');

const padres = [
  "MA. ARELI GONGORA OCAMPO",
  "SILVIANO GARCIA AYALA",
  "ELIA GOMEZ MORENO",
  "MARIO MIRANDA SALGADO"
];

const padrinos = [
  { icon: FaBible, names: "Ricardo Garcia & Adriana Sotelo", role: "Padrinos de Biblia" },
  { icon: IoDiamond, names: "Tomás Castillo & Aracely Ortega", role: "Padrinos de Anillos" },
  { icon: PiHandCoins, names: "Roberto De León & Claudia Valencia", role: "Padrinos de Arras" },
  { icon: GiLinkedRings, names: "Polly Lagunas & Minerva Gongora", role: "Padrinos de Lazo" },
  { icon: GiPillow, names: "Luis Luviano & Carmen Castrejón", role: "Padrinos de Cojines" },
];

const itinerary = [
  { icon: MdChurch, time: "2:00 p.m.", description: "Ceremonia" },
  { icon: LiaCocktailSolid, time: "3:00 p.m.", description: "Cóctel de Bienvenida" },
  { icon: IoIosRestaurant, time: "4:30 p.m.", description: "Banquete" },
  { icon: Music, time: "5:30 p.m.", description: "Bailes Oficiales" },
  { icon: GiPartyPopper, time: "6:00 p.m.", description: "Inicia la Fiesta" },
];

const locationAddress = "Av. Jiutepec #87, esquina Paseo de las Rosas. Colonia Atlacomulco, C.P. 62560, Jiutepec, Morelos.";
const googleMapsUrl = "https://maps.app.goo.gl/RCKCQHaGdfsZZzpz9";

function InvitationPageContent() {
  const searchParams = useSearchParams();
  const initialInvitationIdFromUrl = searchParams.get('id');

  const [invitationIdFromUrl, setInvitationIdFromUrl] = useState<string | null>(initialInvitationIdFromUrl);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null); 

  const [confirmedAdults, setConfirmedAdults] = useState<string[]>([]);
  const [confirmedKids, setConfirmedKids] = useState<string[]>([]);
  const [isRejected, setIsRejected] = useState<boolean>(false);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState<boolean>(false);
  const [assignedPasses, setAssignedPasses] = useState<number>(0);
  const [invitationName, setInvitationName] = useState<string>('');
  const [audioReady, setAudioReady] = useState(false);


  useEffect(() => {
    const newId = searchParams.get('id');
    if (newId !== invitationIdFromUrl) {
      setInvitationIdFromUrl(newId);
      // Reset all related states when ID from URL changes
      setInvitationData(null);
      setIsLoading(true);
      setError(null);
      setConfirmedAdults([]);
      setConfirmedKids([]);
      setIsRejected(false);
      setIsAlreadyConfirmed(false);
      setAssignedPasses(0);
      setInvitationName('');
      setIsPlaying(false); 
      setAudioReady(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; 
      }
    }
  }, [searchParams, invitationIdFromUrl]);

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
  

  useEffect(() => {
      let isEffectMounted = true; 

      const handlePlay = () => { if (isEffectMounted) setIsPlaying(true); };
      const handlePause = () => { if (isEffectMounted) setIsPlaying(false); };
      const handleEnded = () => { 
        if (isEffectMounted) {
            setIsPlaying(false); 
            if(audioRef.current) audioRef.current.currentTime = 0; 
        }
      }; 
      const handleAudioError = (e: Event) => { 
        console.error("Audio Element Error:", e); 
        if (isEffectMounted) setIsPlaying(false);
      };

    const fetchDataAndSetupAudio = async () => {
      if (!isEffectMounted) return;
      setAudioReady(false); 

      if (!invitationIdFromUrl) {
        setError("Por favor, verifica el enlace o contacta a los novios.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      console.log(`Fetching data for invitation ID from URL: ${invitationIdFromUrl}...`);

      try {
        const data = await getInvitationData(invitationIdFromUrl);

        if (!isEffectMounted) return;

        if (!data) {
          console.log(`Invitation ID ${invitationIdFromUrl} (or its fused equivalent) not found.`);
          setError("Por favor, verifica el enlace o contacta a los novios.");
          setInvitationData(null);
        } else {
            console.log("Invitation data fetched successfully:", data);
            setInvitationData(data); 
            setInvitationName(data.Nombre || 'Invitado/a');
            setAssignedPasses(data.PasesAsignados || 0);
            setIsAlreadyConfirmed(data.Confirmado);
            setIsRejected(data.Confirmado && data.PasesConfirmados === 0); 
            setConfirmedAdults(data.Asistentes || []);
            setConfirmedKids(data.Kids || []);
        }


        if (!audioRef.current) {
          console.log("Creating new audio element and adding listeners.");
          const audioElement = document.createElement('audio');
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
          
          audioElement.addEventListener('play', handlePlay);
          audioElement.addEventListener('pause', handlePause);
          audioElement.addEventListener('ended', handleEnded);
          audioElement.addEventListener('error', handleAudioError);
          audioRef.current = audioElement;
        }

        if (isEffectMounted) {
            setAudioReady(true);
            if (data && audioRef.current) { 
              console.log("Attempting to autoplay music...");
              audioRef.current.play().then(() => {
                 if(isEffectMounted) setIsPlaying(true);
                 console.log("Audio playback started successfully.");
              }).catch(e => {
                console.warn("Autoplay attempt failed. User interaction might be needed to start music initially.", e);
                if(isEffectMounted) setIsPlaying(false); 
              });
            } else if (!data && isEffectMounted) { 
                if (audioRef.current) audioRef.current.pause();
                setIsPlaying(false);
            }
        }
        
      } catch (err) {
        console.error("Error in fetchDataAndSetupAudio:", err);
        if (isEffectMounted) {
          setError(err instanceof Error ? err.message : "Error al cargar los datos de la invitación.");
          setInvitationData(null); 
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false); 
        }
      } finally {
        if (isEffectMounted) setIsLoading(false);
      }
    };

    fetchDataAndSetupAudio();

    return () => {
      isEffectMounted = false;
      setAudioReady(false);
      const currentAudio = audioRef.current;
      if (currentAudio) {
        console.log("Cleaning up audio: pausing, removing listeners.");
        currentAudio.pause();
        currentAudio.removeEventListener('play', handlePlay);
        currentAudio.removeEventListener('pause', handlePause);
        currentAudio.removeEventListener('ended', handleEnded);
        currentAudio.removeEventListener('error', handleAudioError);
      }
    };
  }, [invitationIdFromUrl]); 


  const togglePlayPause = () => {
    if (!audioRef.current || !audioReady) {
        console.warn("Audio not ready or not initialized. Cannot toggle play/pause.");
        return;
    }
    const currentAudio = audioRef.current;
    if (currentAudio.paused) {
      currentAudio.play().catch(error => {
        console.error("Audio playback failed on toggle:", error);
      });
    } else {
      currentAudio.pause();
    }
  };

  const handleConfirmation = async (adults: string[], kids: string[], rejected: boolean) => {
     const idForConfirmation = invitationData?.BodaID;

     if (!idForConfirmation) {
        console.error("Cannot submit confirmation without a valid effective invitation ID from fetched data.");
        setError("Error: ID de invitación efectivo no disponible.");
        return;
     }
     setIsSubmitting(true);
     setError(null);
     try {
        await submitConfirmation(idForConfirmation, { adults, kids, rejected });
        console.log("Confirmation submitted successfully for effective BodaID:", idForConfirmation, { adults, kids, rejected });
        
        setIsAlreadyConfirmed(true);
        setIsRejected(rejected);
        setConfirmedAdults(adults);
        setConfirmedKids(kids);
        setInvitationData(prevData => prevData ? ({
            ...prevData,
            BodaID: idForConfirmation,
            Confirmado: true,
            PasesConfirmados: rejected ? 0 : (adults.length + kids.length),
            Asistentes: adults,
            Kids: kids
        }) : null);

     } catch (error) {
         console.error("Failed to submit confirmation:", error);
         setError("Error al enviar la confirmación. Inténtalo de nuevo.");
     } finally {
       setIsSubmitting(false);
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

   if (isLoading && !invitationData && !error && invitationIdFromUrl) { 
     return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
   }

   if (error || (!isLoading && !invitationIdFromUrl) || (!isLoading && invitationIdFromUrl && !invitationData && audioReady) ) {
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
   
  if (!invitationData && !isLoading && !audioReady && invitationIdFromUrl) { 
    return <div className="flex justify-center items-center min-h-screen">Cargando invitación...</div>;
  }

  if (!invitationData && !isLoading && audioReady && invitationIdFromUrl) { 
    return (
            <div className="min-h-screen text-foreground overflow-x-hidden">
                {renderHeader()}
                <div className="flex flex-col items-center justify-center text-center p-4 mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Invitación no encontrada</h2>
                    <p className="text-muted-foreground">{"Por favor, verifica el enlace o contacta a los novios."}</p>
                </div>
            </div>
       );
  }

  if (!invitationData) { 
    return <div className="flex justify-center items-center min-h-screen">Cargando invitación...</div>;
  }


  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      {renderHeader()}
      <main className="px-4 md:px-6 py-10 space-y-10 md:space-y-12">

            <AnimatedSection animationType="slideInLeft" className="flex flex-col items-center space-y-3">
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Música de Fondo</h3>
                <Button
                ref={toggleButtonRef} 
                variant="outline"
                size="icon"
                className="rounded-full h-14 w-14 border-2 border-primary hover:bg-primary/10"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
                disabled={!audioReady} 
                >
                 {isPlaying ? <Volume2 className="h-7 w-7 text-primary" /> : <VolumeX className="h-7 w-7 text-muted-foreground" />}
                </Button>
                {!isPlaying && audioReady && (
                    <p className="text-sm text-muted-foreground mt-2">Haz clic para iniciar la música.</p>
                )}
            </AnimatedSection>
          
          {!isRejected && (
            <>
              <AnimatedSection animationType="slideInRight">
                  <Card className="shadow-lg border-none bg-secondary/10 p-4 md:p-6 rounded-lg">
                      <CardContent className="pt-4">
                      <p className="text-base md:text-lg text-center italic">
                          "Todos los días juntos son días maravillosos y queremos que nos acompañen en el más importante para nosotros."
                      </p>
                      </CardContent>
                  </Card>
              </AnimatedSection>

              <Separator className="my-6 md:my-8" />
              
              <AnimatedSection animationType="fade" className="text-center mb-10">
                  <div className="space-y-1 md:space-y-2">
                        <p className="text-lg md:text-xl">Sábado</p>
                        <div className="inline-block bg-primary/80 text-primary-foreground rounded-lg p-2 md:p-3 shadow-md">
                            <div className="text-4xl md:text-5xl font-bold">26</div>
                            <div className="text-base md:text-lg">julio</div>
                        </div>
                        <p className="text-lg md:text-xl mt-1">2025</p>
                    </div>
              </AnimatedSection>

              <AnimatedSection animationType="slideInRight" className="text-center">
                  <h3 className="text-xl md:text-2xl font-semibold mb-3">Sólo Faltan</h3>
                  <Countdown targetDate={weddingDate} />
              </AnimatedSection>

              <Separator className="my-6 md:my-8" />

              <AnimatedSection animationType="fade">
                  <h3 className="text-4xl font-julietta text-center mb-4 text-primary">uestros momento</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
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
                              src="/images/mosaic/M8.jpeg" 
                              alt="Oscar y Silvia Mosaico 2" 
                              fill
                              style={{ objectFit: "cover" }}
                              className="animate-zoom-loop-short"
                              sizes="(max-width: 768px) 50vw, 33vw"
                              data-ai-hint="pareja sonriendo exterior" 
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

              <Separator className="my-6 md:my-8" />

              <div className="grid grid-cols-1 gap-6 md:gap-10"> 
                  <AnimatedSection animationType="slideInLeft" className="text-center">
                      <h3 className="text-4xl font-julietta mb-3 text-primary">uestros Padre</h3>
                      <div className="space-y-1 text-base md:text-lg">
                      {padres.map((nombre, index) => (
                          <p key={index}>{nombre}</p>
                      ))}
                      </div>
                  </AnimatedSection>

                  <AnimatedSection animationType="slideInRight" className="text-center">
                      <h3 className="text-4xl font-julietta mb-3 text-primary">uestros Padrino</h3>
                      <div className="space-y-3">
                            {padrinos.map((padrino, index) => (
                                <PadrinoItem key={index} icon={padrino.icon} names={padrino.names} role={padrino.role} />
                            ))}
                      </div>
                  </AnimatedSection>
              </div>

              <Separator className="my-6 md:my-8" />

              <AnimatedSection animationType="fade">
                  <h3 className="text-4xl font-julietta text-center mb-4 text-primary">tinerari</h3>
                  <TimelineItinerary items={itinerary} />
              </AnimatedSection>

              <Separator className="my-6 md:my-8" />

              <AnimatedSection animationType="slideInUp">
                  <Card className="text-center shadow-lg border-none bg-secondary/10 p-4 md:p-6 rounded-lg">
                      <CardHeader className="p-0 pb-2">
                          <CardTitle className="text-2xl md:text-3xl font-semibold flex items-center justify-center gap-2">
                              <MapPin className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                              Ubicación - Jardín Margaty
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                          <p className="text-base md:text-lg">{locationAddress}</p>
                          <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                  Abrir en GPS
                              </a>
                          </Button>
                      </CardContent>
                  </Card>
              </AnimatedSection>

              <Separator className="my-6 md:my-8" />
            </>
          )}

           <AnimatedSection animationType="fade">
               <h3 className="text-4xl font-julietta text-center mb-4 text-primary">onfirma tu asistenci</h3>

                <div className="text-center mb-4">
                     <p className="text-sm text-muted-foreground">Invitación para:</p>
                     <p className="text-3xl font-semibold text-foreground">{invitationName || "Invitado/a"}</p>

                     {!isAlreadyConfirmed && (
                         <p className="text-xs text-destructive font-bold mt-1">{assignedPasses === 1 ? '1 Pase Asignado' : `${assignedPasses} Pases Asignados`}</p>
                     )}
                     {isAlreadyConfirmed && !isRejected && invitationData?.PasesConfirmados !== undefined && invitationData.PasesConfirmados > 0 && (
                        <p className="text-xs text-destructive font-bold mt-1">{invitationData.PasesConfirmados === 1 ? '1 Pase Confirmado' : `${invitationData.PasesConfirmados} Pases Confirmados`}</p>
                     )}
                </div>

               {isAlreadyConfirmed ? (
                    isRejected ? (
                        <Card className="bg-muted/50 p-4 rounded-lg shadow">
                            <CardContent className="flex items-center gap-3 pt-4">
                            <XCircle className="h-6 w-6 md:h-7 md:w-7 text-destructive" />
                            <p className="text-sm md:text-base text-muted-foreground">Lamentamos no poder contar con tu presencia y agradecemos mucho tu respuesta, ya que con ello podremos organizar óptimamente los lugares.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-secondary/10 p-4 rounded-lg shadow">
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-primary">
                                <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                                ¡Confirmación Recibida!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <p className="mb-1 text-sm md:text-base">Gracias por confirmar. Has reservado lugar para:</p>
                                
                                {confirmedAdults.length > 0 && (
                                    <div>
                                        <p className="font-medium text-sm md:text-base">Adultos:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                                            {confirmedAdults.map((guest, index) => (
                                                <li key={`adult-${index}`} className="font-semibold">{guest}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {confirmedKids.length > 0 && (
                                     <div>
                                        <p className="font-medium text-sm md:text-base mt-2">Niños:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                                            {confirmedKids.map((guest, index) => (
                                                <li key={`kid-${index}`} className="font-semibold">{guest}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {confirmedAdults.length === 0 && confirmedKids.length === 0 && (
                                    <p className="italic text-muted-foreground text-sm md:text-base">(No se registraron nombres)</p>
                                )}
                            </CardContent>
                        </Card>
                    )
                ) : (
                   <ConfirmationForm
                      invitationId={invitationData?.BodaID || invitationIdFromUrl || ''}
                      assignedPasses={assignedPasses}
                      onConfirm={handleConfirmation}
                      isLoading={isSubmitting}
                   />
               )}

               {error && !isSubmitting && !isAlreadyConfirmed && ( 
                   <p className="text-center text-destructive mt-3 text-sm">{error}</p>
               )}
          </AnimatedSection>
        </main>

      <footer className="text-center py-6 bg-muted/50 mt-10">
          <p className="text-muted-foreground text-sm">Silvia &amp; Oscar - 26 julio 2025</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Cargando invitación...</div>}>
      <InvitationPageContent />
    </Suspense>
  );
}
