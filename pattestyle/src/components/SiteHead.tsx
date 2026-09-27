import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const GA_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID as string | undefined;

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

  useEffect(() => {
    if (!GA_ID || typeof (window as any).gtag !== 'function') return;
    (window as any).gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [location.pathname, location.search]);

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </script>

      {GA_ID && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
      )}
      {GA_ID && (
        <script>
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false });`}
        </script>
      )}
    </Helmet>
  );
};

export default SiteHead;
