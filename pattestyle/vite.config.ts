import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [react(), tailwindcss()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  // Remplace des placeholders dans index.html directement à partir des
  // variables d'environnement réelles (process.env, injectées par Vercel),
  // sans dépendre d'un fichier .env présent dans le repo — un fichier .env
  // peut manquer après un upload manuel (fichiers cachés non inclus).
  plugins.push({
    name: 'html-env-placeholders',
    transformIndexHtml(html: string) {
      const raw = env.VITE_GSC_VERIFICATION || process.env.VITE_GSC_VERIFICATION || '';
      // Tolérance : si la balise <meta ... content="CODE" /> entière a été collée,
      // on n'en garde que CODE.
      const match = raw.match(/content=["']([^"']+)["']/);
      const code = (match ? match[1] : raw).trim().replace(/^["']|["']$/g, '');

      // Google Analytics 4 : on extrait l'ID (G-XXXXXXXXXX) même si un extrait
      // de code entier a été collé, puis on écrit le snippet en dur dans le HTML
      // (visible immédiatement par les navigateurs et par l'outil de vérification Google).
      const rawGa = env.VITE_GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID || '';
      const gaMatch = rawGa.match(/G-[A-Z0-9]+/i);
      const gaId = gaMatch ? gaMatch[0].toUpperCase() : '';
      const gaSnippet = gaId
        ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', { send_page_view: false });
    </script>`
        : '';

      return html
        .replace('__GSC_VERIFICATION__', () => code)
        .replace('<!--GA_SNIPPET-->', () => gaSnippet);
    }
  });

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
