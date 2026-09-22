# Déploiement PatteStyle — checklist

## 0. Configurer Supabase (si ce n'est pas déjà fait)
- [ ] Crée un compte/projet sur [supabase.com](https://supabase.com) (gratuit pour démarrer).
- [ ] Dans ton nouveau projet, va dans **SQL Editor** > **New query**, colle le contenu du fichier `supabase/schema.sql` fourni dans ce projet, puis exécute (Run). Ça crée les tables `products`, `orders`, `customers`, `reviews`, `store_settings`.
- [ ] Va dans **Project Settings > API** : note l'**URL du projet** et la **clé `anon` (public)** et la **clé `service_role` (secret)** — tu en auras besoin à l'étape 2.

## 1. Avant de pousser sur GitHub
- [ ] Vérifie qu'aucun fichier `.env`, `.env.local` n'est suivi par git (ils sont dans `.gitignore`).
- [ ] `vercel.json` ne contient plus aucune valeur secrète (c'est fait).

## 2. Variables d'environnement à configurer dans Vercel
Vercel > ton projet > Settings > Environment Variables. Ajoute (Production + Preview + Development) :

| Variable | Où la trouver |
|---|---|
| `VITE_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API (clé publique) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API (clé secrète — jamais côté client) |
| `ADMIN_ACCESS_CODE` | Choisis un code d'accès admin fort, connu de toi seul |
| `ADMIN_TOKEN_SECRET` | Une chaîne longue et aléatoire (ex: générée avec `openssl rand -hex 32`) |
| `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_AUTH_PROXY` | Si l'auth Google est utilisée |

## 3. Pousser sur GitHub
```
git init
git add .
git commit -m "Initial commit PatteStyle"
git branch -M main
git remote add origin <url-de-ton-repo>
git push -u origin main
```

## 4. Déployer sur Vercel
- Importe le repo GitHub dans Vercel.
- Vérifie que les variables d'environnement (étape 2) sont bien renseignées avant le premier déploiement.
- Lance le déploiement.

## 5. Après déploiement
- Teste la connexion admin avec ton `ADMIN_ACCESS_CODE`.
- Vérifie qu'un visiteur non connecté ne peut pas accéder aux données clients ni modifier le catalogue (essaie d'appeler `/api/customers` ou de faire un POST sur `/api/products` sans être connecté : ça doit renvoyer une erreur 401).
