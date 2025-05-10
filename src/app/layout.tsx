import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster" // Import Toaster
import { cn } from '@/lib/utils'; // Import cn utility

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['300', '400', '700'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bodasilviaoscar.site'; // Fallback to production URL

export const metadata: Metadata = {
  title: 'Boda Silvia y Oscar', // Updated title
  description: '¡Acompáñanos a celebrar nuestra boda!', // Updated description
  openGraph: {
    title: 'Boda Silvia y Oscar', // Updated title
    description: '¡Acompáñanos a celebrar nuestra boda!', // Updated description
    url: siteUrl,
    siteName: 'Boda Silvia y Oscar', // Updated siteName
    images: [
      {
        url: `${siteUrl}/images/Portada_h.jpg`, // Absolute URL for the image
        width: 1200, // Standard Open Graph image width
        height: 630, // Standard Open Graph image height
        alt: 'Oscar y Silvia - Invitación de Boda',
      },
    ],
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boda Silvia y Oscar', // Updated title
    description: '¡Acompáñanos a celebrar nuestra boda!', // Updated description
    images: [`${siteUrl}/images/Portada_h.jpg`], // Absolute URL for the image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Apply background to body to fill space outside the main container */}
      <body className={cn(
        `${playfair.variable} ${lato.variable} font-lato antialiased`,
        "bg-muted/30" // Light gray background for the body
      )}>
        {/* Main container to simulate mobile viewport */}
        <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-background shadow-xl">
          {children}
        </div>
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
