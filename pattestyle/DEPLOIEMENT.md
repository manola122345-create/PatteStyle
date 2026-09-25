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
| `STRIPE_SECRET_KEY` | Dashboard Stripe > Développeurs > Clés API (clé secrète, `sk_live_...` ou `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Voir étape 2bis ci-dessous |
| `RESEND_API_KEY` | Compte sur resend.com (gratuit) > API Keys > créer une clé |
| `ORDER_NOTIFICATION_EMAIL` | `shoppattes@gmail.com` (reçoit un email à chaque commande payée) |
| `CONTACT_EMAIL` | `shoppattes@gmail.com` (reçoit les messages du formulaire de contact) |
| `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_AUTH_PROXY` | Si l'auth Google est utilisée |

## 2bis. Configurer le webhook Stripe (obligatoire pour que les commandes se confirment)
1. Déploie une première fois le site (les autres variables suffisent pour que le build passe).
2. Va sur le [Dashboard Stripe](https://dashboard.stripe.com) > Développeurs > Webhooks > "Add endpoint".
3. URL de l'endpoint : `https://<ton-domaine-vercel>.vercel.app/api/stripe-webhook`
4. Événement à écouter : `checkout.session.completed`
5. Une fois créé, Stripe affiche un "Signing secret" (commence par `whsec_...`) : copie-le dans la variable `STRIPE_WEBHOOK_SECRET` sur Vercel, puis redéploie.

Sans cette étape, le paiement fonctionnera mais les commandes resteront bloquées en "En attente de paiement" et aucun email de notification ne partira.

**Note Resend** : sans domaine vérifié, l'adresse d'envoi par défaut `onboarding@resend.dev` ne peut envoyer que vers l'adresse email avec laquelle tu t'es inscrit sur Resend. Si `shoppattes@gmail.com` n'est pas cette adresse, inscris-toi sur Resend avec `shoppattes@gmail.com`, ou vérifie un nom de domaine dans Resend (Domains > Add Domain) et utilise une adresse `@tondomaine.com` dans `ORDER_NOTIFICATION_FROM`.

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

## 6. SEO : Google Search Console & Google Analytics

**Google Search Console** (indexation, suivi des positions sur Google)
1. Va sur [search.google.com/search-console](https://search.google.com/search-console), ajoute une propriété avec ton URL Vercel (ou ton domaine final).
2. Choisis la méthode de vérification "Balise HTML" — Google te donne un code du type `content="abc123..."`.
3. Ajoute une variable `VITE_GSC_VERIFICATION` sur Vercel avec juste cette valeur (sans les guillemets), redéploie, puis clique "Vérifier" sur Search Console.
4. Une fois vérifié, va dans "Sitemaps" et soumets : `sitemap.xml`

**Google Analytics 4** (statistiques de visite)
1. Va sur [analytics.google.com](https://analytics.google.com), crée une propriété GA4 pour PatteStyle.
2. Récupère ton "ID de mesure" (commence par `G-...`).
3. Ajoute une variable `VITE_GA_MEASUREMENT_ID` sur Vercel avec cette valeur, redéploie.

**Google Merchant Center** (listing gratuit sur Google Shopping — recommandé pour du e-commerce)
1. Va sur [merchants.google.com](https://merchants.google.com), crée un compte pour PatteStyle.
2. Dans "Produits" > "Flux", ajoute un flux avec l'URL : `https://ton-site.vercel.app/product-feed.xml`
3. Merchant Center revalidera le flux automatiquement à intervalle régulier.

Sans ces 3 variables/étapes, le site fonctionne normalement — le SEO technique (sitemap, robots.txt, balises meta, données structurées) est déjà actif par défaut.
