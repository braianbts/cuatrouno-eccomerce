import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import CreatinaToast from "@/components/CreatinaToast";
import { Analytics } from "@vercel/analytics/react";
import PageTracker from "@/components/PageTracker"
import IntroSplash from "@/components/IntroSplash"
import TriviaWidget from "@/components/TriviaWidget";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = 'https://cuatrouno-eccomerce.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cuatrouno Suplementos | Escobar, Buenos Aires',
    template: '%s | Cuatrouno Suplementos',
  },
  description: 'Tienda de suplementos deportivos en Escobar, Buenos Aires. Proteínas, creatina, pre-workout, vitaminas y más. Asesoramiento personalizado y envíos a todo el país.',
  keywords: ['suplementos deportivos', 'proteína whey', 'creatina', 'pre-workout', 'suplementos Escobar', 'suplementos Buenos Aires', 'cuatrouno suplementos'],
  authors: [{ name: 'Cuatrouno Suplementos' }],
  creator: 'Cuatrouno Suplementos',
  publisher: 'Cuatrouno Suplementos',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'Cuatrouno Suplementos',
    title: 'Cuatrouno Suplementos | Escobar, Buenos Aires',
    description: 'Tienda de suplementos deportivos en Escobar, Buenos Aires. Proteínas, creatina, pre-workout, vitaminas y más. Asesoramiento personalizado.',
    images: [{ url: '/pop-up.jpg', width: 1200, height: 630, alt: 'Cuatrouno Suplementos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuatrouno Suplementos | Escobar, Buenos Aires',
    description: 'Tienda de suplementos deportivos en Escobar. Proteínas, creatina, pre-workout y más.',
    images: ['/pop-up.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        {/* WhatsApp float button */}
        <a
          href="https://wa.me/5493484689931?text=Hola%21%20Quiero%20consultar%20sobre%20suplementos."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110"
          style={{ backgroundColor: '#25D366' }}
          aria-label="Contactar por WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="28" height="28">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L0 24l6.335-1.508A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.373l-.36-.214-3.727.977.994-3.634-.235-.374A9.818 9.818 0 1112 21.818z"/>
          </svg>
        </a>
        <IntroSplash />
        <TriviaWidget />
        <AnnouncementBar />
        <CreatinaToast />
        <Navbar />
        <PageTracker />
        <main>{children}</main>
        <Analytics />

        {/* Interactive map */}
        <div className="relative">
          <div className="px-0" style={{ background: 'linear-gradient(90deg, #C41515 0%, #8b0000 50%, #C41515 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-1">Dónde encontrarnos</p>
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Escobar, Buenos Aires</h3>
              </div>
              <a href="https://maps.app.goo.gl/Jcd7tyRY5g3KeBP99" target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                Abrir en Maps →
              </a>
            </div>
          </div>
          <div className="w-full overflow-hidden" style={{ height: '380px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d-58.794372!3d-34.3486727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bb61c0009291e9%3A0xcbe9fe796eafb167!2s%C2%AEcuatrouno%20suplementos!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
              width="100%"
              height="380"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8) brightness(0.9)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Cuatrouno Suplementos"
            />
          </div>
        </div>
        <footer className="bg-[#0d0d0d] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Logo + tagline */}
            <div className="flex flex-col gap-4">
              <img src="/logo.png" alt="Cuatrouno Suplementos" className="h-10 w-auto object-contain object-left" />
              <p className="text-white/30 text-sm leading-relaxed max-w-xs">
                Suplementos deportivos de calidad para alcanzar tus objetivos. Asesoramiento personalizado.
              </p>
            </div>

            {/* Navegación */}
            <div className="flex flex-col gap-3">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Navegación</p>
              {[{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/productos' }].map(({ label, href }) => (
                <a key={href} href={href} className="text-white/50 hover:text-white text-sm transition-colors">{label}</a>
              ))}
            </div>

            {/* Contacto */}
            <div className="flex flex-col gap-3">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Contacto</p>
              <a href="https://wa.me/5493484689931" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-sm transition-colors">WhatsApp — +54 9 3484 689931</a>
              <a href="https://www.instagram.com/cuatrouno_suplementos/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-sm transition-colors">Instagram — @cuatrouno_suplementos</a>
              <a href="https://maps.app.goo.gl/UkGEujSp6UYeUEun8" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-sm transition-colors">Ubicación — Escobar, Buenos Aires</a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-white/20 text-xs">© {new Date().getFullYear()} Cuatrouno Suplementos. Todos los derechos reservados.</p>
              <p className="text-white/15 text-xs">Desarrollado por <span className="text-white/25">Braian Yamil Barrientos</span> · Ingeniero en Sistemas M. 417/441</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
