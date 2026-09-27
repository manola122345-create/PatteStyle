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
      return html.replace(
        '__GSC_VERIFICATION__',
        env.VITE_GSC_VERIFICATION || process.env.VITE_GSC_VERIFICATION || ''
      );
    }
  });

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
