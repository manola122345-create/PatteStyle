import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { initPixels, trackPageView } from '../lib/tracking';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'PatteStyle',
  description: "Boutique européenne d'accessoires premium pour chiens et chats.",
  url: typeof window !== 'undefined' ? window.location.origin : '',
  logo: typeof window !== 'undefined' ? `${window.location.origin}/favicon.svg` : '',
  areaServed: 'EU',
  priceRange: '€€'
};

const SiteHead: React.FC = () => {
  const location = useLocation();
  const pixelsInitialized = useRef(false);

  // Charge les vrais identifiants Meta/TikTok configurés dans l'admin
  // (Marketing) au premier chargement du site.
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        initPixels({ meta: data?.meta_pixel_id, tiktok: data?.tiktok_pixel_id });
        pixelsInitialized.current = true;
      })
      .catch((err) => console.error('Erreur chargement pixels:', err));
  }, []);

  // Google Analytics 4 est chargé directement dans index.html (uniquement si
  // VITE_GA_MEASUREMENT_ID est défini). Sur un site SPA, on envoie ici une vue
  // de page à chaque changement de route, y compris pour la toute première page.
  useEffect(() => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title
      });
    }
    if (pixelsInitialized.current) {
      trackPageView();
    }
  }, [location.pathname, location.search]);

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </script>
    </Helmet>
  );
};

export default SiteHead;
