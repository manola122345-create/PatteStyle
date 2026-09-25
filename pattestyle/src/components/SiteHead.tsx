import React from 'react';
import { Helmet } from 'react-helmet-async';

const GA_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID as string | undefined;
const GSC_VERIFICATION = (import.meta as any).env?.VITE_GSC_VERIFICATION as string | undefined;

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
  return (
    <Helmet>
      {GSC_VERIFICATION && (
        <meta name="google-site-verification" content={GSC_VERIFICATION} />
      )}

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
gtag('config', '${GA_ID}');`}
        </script>
      )}
    </Helmet>
  );
};

export default SiteHead;
