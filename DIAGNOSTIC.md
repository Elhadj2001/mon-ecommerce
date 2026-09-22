# DIAGNOSTIC — MAISON NIANG (mon-ecommerce)

*Audit en lecture seule — 22 septembre 2026. Aucun fichier du projet n'a été modifié à l'exception de ce rapport.*

Commandes exécutées : `git status/diff/log/show`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npx prisma validate`, `npx prisma migrate status`, lectures de fichiers.

---

## Synthèse

**Non, le projet n'est pas déployable en l'état — et surtout, ce qui tourne actuellement en production est dangereux.**

1. Le code déployé sur Vercel (`origin/main` = `61d38d9`) ne vérifie **jamais** le rôle admin : `middleware.ts` y appelle `auth.protect()`, qui exige seulement *d'être connecté*. N'importe quel client inscrit peut appeler `/api/admin/*`.
2. Dans cette même version, `/api/admin/reset-db` est une route **GET sans confirmation** qui vide commandes, produits, images et catégories. Un simple clic d'un utilisateur connecté détruit la boutique.
3. Le correctif existe en local mais **n'est pas commité** : 26 fichiers modifiés + 5 fichiers non suivis (`lib/auth.ts`, `lib/rate-limit.ts`, `lib/logger.ts`, `lib/validations/promo.ts`, `lib/validations/review.ts`) + `prisma/migrations/`.
4. Attention : commiter les 26 fichiers **sans** les 5 nouveaux casse le build (imports `@/lib/auth` introuvables). C'est tout ou rien.
5. Côté fonctionnel, le montant que le client doit payer sur `/success/[orderId]` **ignore les frais de port et la remise** : le client paie le mauvais prix.

Le reste est sain : `tsc --noEmit` passe sans une seule erreur, `next build` réussit, `prisma validate` et `migrate status` sont verts.

---

## Tableau des anomalies

| # | Gravité | Fichier(s) | Problème | Impact concret | Correction proposée | Risque de régression |
|---|---------|-----------|----------|----------------|---------------------|----------------------|
| 1 | **BLOQUANT** | `middleware.ts` (version `origin/main`, l.4-11) | En production, `auth.protect()` ne vérifie que l'authentification, jamais le rôle admin. Aucune route `/api/admin/*` ni la page `/admin` ne contrôle `role === 'admin'`. | Tout client ayant créé un compte peut : lister/exporter toutes les commandes (nom, téléphone, adresse), créer/supprimer des codes promo, marquer des commandes comme payées, créer/modifier/supprimer des produits, accéder à l'interface `/admin`. | Déployer le `middleware.ts` local (l.24-39) qui teste `sessionClaims.metadata.role === 'admin'` **et** `ADMIN_USER_IDS`, + `requireAdmin()` dans chaque route. | Faible — mais voir #12 : sans `ADMIN_USER_IDS` ni rôle Clerk positionné, l'admin se verrouille dehors. |
| 2 | **BLOQUANT** | `app/api/admin/reset-db/route.ts` (version `origin/main`) | Route **GET**, sans body ni confirmation, qui exécute 6 `deleteMany({})`. Combinée à #1, elle est atteignable par tout utilisateur connecté. | Perte totale et irréversible des commandes, produits, images, catégories de production. Un préchargement de lien ou un crawler authentifié suffit. | Déployer la version locale : `POST` + `requireAdmin()` + `confirm: 'RESET'` + garde `ALLOW_RESET_DB` (l.8-31). | Nul — la route n'a aucun appelant dans le code. |
| 3 | **BLOQUANT** | `lib/auth.ts`, `lib/rate-limit.ts`, `lib/logger.ts`, `lib/validations/promo.ts`, `lib/validations/review.ts`, `prisma/migrations/` | Ces 6 chemins sont absents de `origin/main` (vérifié par `git cat-file -e`), alors que 13 fichiers modifiés les importent. | Tout le travail de sécurisation (contrôle admin, rate-limit, validation Zod) est invisible en production. Et un commit partiel casserait le build Vercel. | `git add` des 5 fichiers **et** du dossier `prisma/migrations/` dans le même commit que les 26 fichiers modifiés. | Moyen — le nouveau code n'a jamais tourné en production ; tester `/checkout` et `/admin` juste après déploiement. |
| 4 | **MAJEUR** | `app/success/[orderId]/page.tsx:54` | `const total = order.orderItems.reduce(...)` — somme des articles uniquement. `order.shippingCost` et `order.discount` sont ignorés, alors qu'ils sont bien stockés en base. | Ce montant est affiché **4 fois** comme la somme à envoyer (l.109 Wave, l.127 Orange Money, l.146/154 PayPal, l.170 espèces). Client à Thiès sans livraison offerte : on lui demande ~3 000 FCFA de moins que le vrai total. Client avec code promo : on lui demande **plus** que ce qu'il a accepté. | `const total = Math.max(0, subtotal + Number(order.shippingCost) - Number(order.discount))`, comme déjà fait dans `app/admin/orders/page.tsx:140`. | Faible — formule déjà éprouvée ailleurs dans le projet. |
| 5 | **MAJEUR** | `app/api/checkout/custom/route.ts:30, 114-115` + `lib/validations/checkout.ts:33-34` | `discount` et `shippingCost` arrivent du client (`app/checkout/page.tsx:159-160`) et sont écrits tels quels en base. Zod ne vérifie que `z.number().min(0)`. L'API ne recalcule rien. | Un POST forgé avec `discount: 99999` crée une commande dont le total admin (`admin/orders/page.tsx:140`), l'e-mail (`custom/route.ts:148`) et l'export CSV (`orders/export/route.ts:39`) affichent ~0 FCFA. L'admin peut expédier une commande non payée. Le prix des **articles** reste sûr (recalculé en base l.145-147). | Recalculer `shippingCost` côté serveur à partir de `customer.city` et `isFreeShipping`, et `discount` en rejouant la logique de `/api/promo/validate` (l.43-49). Ne garder du client que `promoCode` et la ville. | Moyen — dupliquer la table des villes (`app/checkout/page.tsx:88-105`) côté serveur ; risque d'écart de libellés. |
| 6 | **MAJEUR** | `app/account/orders/page.tsx:72` | Même calcul tronqué qu'en #4 : total = articles seuls. | Le client voit dans « mes commandes » un montant différent de celui de l'e-mail de confirmation. | Idem #4. | Faible. |
| 7 | **MAJEUR** | `app/admin/page.tsx:30-33` et `:42-44` | Chiffre d'affaires et graphique calculés sur les seuls articles ; `shippingCost` et `discount` ignorés. | Le CA du tableau de bord est faux (surévalué des remises, sous-évalué des frais de port). | Ajouter `+ Number(order.shippingCost) - Number(order.discount)` dans les deux `reduce`. | Faible. |
| 8 | **MAJEUR** | `app/api/admin/export-csv/route.ts:21-23` | Total CSV = articles seuls, et colonne « Email » renseignée avec `order.phone` (l.31). Route par ailleurs redondante avec `app/api/admin/orders/export/route.ts` qui, elle, est correcte (l.36-39). | Export comptable faux. Deux routes d'export divergentes coexistent. | Supprimer cette route et ne garder que `/api/admin/orders/export`, déjà branchée sur `components/admin/ExportButton.tsx:7`. | Nul — aucun appelant dans le code pour `export-csv`. |
| 9 | **MAJEUR** | `app/api/checkout/custom/route.ts:81-101` | `usedCount` est incrémenté à la **création** de la commande, alors que le paiement est manuel et postérieur. Aucun décrément sur `CANCELLED`. | Un code `maxUses: 100` peut être épuisé par 100 commandes jamais payées ; un client peut le griller volontairement. Vérifié : aucun `decrement` de `usedCount` nulle part (`grep usedCount` → seulement l.88 et les lectures). | Déplacer l'incrément dans `app/api/admin/orders/[orderId]/route.ts` au passage à `PAYMENT_RECEIVED`, ou décrémenter au passage à `CANCELLED`. | Moyen — il faut garantir l'idempotence si l'admin change plusieurs fois le statut. |
| 10 | **MAJEUR** | `package.json:8`, absence de `eslint.config.js`, `.eslintignore` | `npm run lint` échoue : *« ESLint couldn't find an eslint.config.(js\|mjs\|cjs) file »*, sortie **exit 2**. De plus `.eslintignore` contient `*` (ignore tout) et n'est plus supporté par ESLint 9. | Zéro couverture lint depuis le passage à ESLint 9. Aucun garde-fou sur les hooks React, les imports morts, les `<img>`. | Créer un `eslint.config.mjs` avec `eslint-config-next` (déjà installé, `package.json:39`) et supprimer `.eslintignore`. | Faible, mais la première exécution remontera probablement des dizaines d'avertissements. |
| 11 | **MAJEUR** | `next.config.js:3-5` | `typescript.ignoreBuildErrors: true`. Le build confirme : `Skipping validation of types`. | Le filet de sécurité TypeScript est désactivé au build. *Aujourd'hui ce n'est pas masquant* — `npx tsc --noEmit` renvoie 0 erreur — mais toute régression de type passera en production sans bruit. | Passer à `false` maintenant que `tsc` est propre. | Faible — vérifié : `tsc --noEmit` sort avec le code 0 et 0 ligne de sortie. |
| 12 | **MAJEUR** | `middleware.ts:4`, `lib/auth.ts:4` vs `.env` / `.env.local` | `ADMIN_USER_IDS` n'existe dans **aucun** des deux fichiers d'environnement. Le contrôle admin repose alors uniquement sur `publicMetadata.role === 'admin'` côté Clerk. | Si ce rôle n'est pas positionné sur le compte propriétaire dans Clerk, le déploiement du correctif #1 rend `/admin` inaccessible **à tout le monde**, y compris au propriétaire (redirection vers `/` — `middleware.ts:35`). | Renseigner `ADMIN_USER_IDS` (Vercel + `.env.local`) **avant** de déployer, ou positionner `publicMetadata.role = "admin"` dans le dashboard Clerk. | Élevé si oublié — verrouillage complet de l'administration. |
| 13 | **MAJEUR** | `app/test-mail/route.ts:1-7` | Route `GET /test-mail` publique (non couverte par `isProtectedRoute`, `middleware.ts:9-14`), qui envoie un vrai e-mail Resend à une adresse en dur, avec un montant de 5 000 « EUR ». Présente dans le build (`ƒ /test-mail`). | Quiconque connaît l'URL peut consommer le quota Resend en boucle et dégrader la réputation d'envoi du domaine. | Supprimer la route, ou la restreindre à `NODE_ENV !== 'production'` + `requireAdmin()`. | Nul — aucun appelant. |
| 14 | MINEUR | `next.config.js`, `next.config.mjs`, `next.config.ts` | Trois fichiers coexistent. L'ordre de résolution de Next 16 (`node_modules/next/dist/shared/lib/constants.js:359-368` : `['next.config.js', 'next.config.mjs', 'next.config.ts', ...]`) fait gagner **`next.config.js`**. | `next.config.ts` (`reactCompiler: true`) n'est **jamais** appliqué ; `babel-plugin-react-compiler` (`package.json:38`) est une dépendance inerte. `next.config.mjs` est un doublon strict de `.js`. | Garder un seul fichier, y reporter `reactCompiler` si on le veut vraiment. | Moyen si on active React Compiler — il faudra revalider toutes les pages client. |
| 15 | MINEUR | `prisma/schema.prisma:10`, `.env.local` | `directUrl` est commenté alors que `DATABASE_URL` de `.env.local` pointe sur pgbouncer (`:6543?pgbouncer=true&connection_limit=1`). | Toute commande `prisma migrate` / `db push` lancée avec `.env.local` viserait le pooler transactionnel : advisory locks et prepared statements y sont indisponibles → échec ou comportement erratique. Aujourd'hui le CLI Prisma charge `.env` (port `5432`, pooler session) — d'où le succès de `migrate status`. La divergence est silencieuse et fragile. | Décommenter `directUrl = env("DIRECT_URL")` et s'assurer que `DIRECT_URL` pointe bien sur le port `5432`. | Faible — mais `DIRECT_URL` diffère entre `.env` (`aws-1-...pooler:5432`) et `.env.local` (`db.<ref>.supabase.co:5432`) : vérifier lequel est le bon. |
| 16 | MINEUR | `app/api/webhook/route.ts:68-81` | Le webhook Stripe décrémente le stock, alors que `/api/checkout/custom:62-79` l'a déjà fait. | **Pas de double décrément aujourd'hui** : aucune session Stripe n'est créée (voir axe 7), donc `checkout.session.completed` n'arrive jamais, et la signature est invérifiable sans `STRIPE_WEBHOOK_SECRET`. Mais le piège est armé si Stripe est rebranché. | Supprimer la route, ou retirer la boucle de décrément l.68-81. | Nul dans l'état actuel. |
| 17 | MINEUR | `stripe.exe`, `structure.txt` | **Oui, `stripe.exe` est versionné** : 31 663 616 octets (31,6 Mo) dans `HEAD`. `structure.txt` : 1 864 204 octets. | Chaque `git clone` de Vercel télécharge un binaire Windows inutile. `.git` pèse 9,3 Mo. | `git rm --cached stripe.exe structure.txt` + ajout au `.gitignore`. Réécriture d'historique optionnelle. | Nul pour l'application. |
| 18 | MINEUR | `lib/rate-limit.ts:11` | `const buckets = new Map()` en mémoire de processus. | Sur Vercel serverless : chaque instance a sa propre Map, un cold start la vide, et le trafic est réparti sur N instances → la limite réelle est `limit × N`, non déterministe. Protège contre un script naïf mono-instance, pas contre un attaquant. | Migrer vers Upstash Redis — le commentaire l.4-8 donne déjà le code. | Faible. |
| 19 | MINEUR | `lib/format.ts` | Fichier jamais importé (`grep "@/lib/format"` → 0 résultat). Son `formatPrice` (l.9-12) formate le nombre **tel quel** en XOF, là où `lib/currency.ts:34` convertit EUR→XOF. Deux fonctions homonymes aux sémantiques opposées. | Piège à ×655,957 pour la prochaine personne qui fait un import automatique. | Supprimer `lib/format.ts`. | Nul. |
| 20 | MINEUR | `app/api/categories/ProductCard.tsx` | Composant React placé dans un dossier d'API. Jamais importé nulle part. Pointe vers `/product/${id}` (l.20), route qui n'existe pas — les routes réelles sont `/products/[id]`. | Code mort + lien cassé si jamais réutilisé. | Supprimer le fichier. | Nul. |
| 21 | MINEUR | `app/retours/page.tsx`, `app/returns/page.tsx` | Deux pages de politique de retour distinctes, toutes deux buildées (`○ /retours`, `○ /returns`). Seule `/retours` est liée (`components/Footer.tsx:18`). | `/returns` est orpheline, indexable, et son contenu diverge de `/retours` (délais et conditions différents) → risque juridique. | Supprimer `app/returns/`, ou rediriger vers `/retours`. | Faible. |
| 22 | MINEUR | `app/success/page.tsx` | Page statique concurrente de `/success/[orderId]`. Génère une référence **aléatoire fictive** (l.18 : `CMD-${Math.random()...}`), affirme « Votre paiement a été confirmé » (l.55) et vide le panier (l.21). | Aucun lien n'y mène (`router.push(\`/success/${data.orderId}\`)`, `app/checkout/page.tsx:174`), mais l'URL est publique et ment au client. | Supprimer `app/success/page.tsx`. | Nul. |
| 23 | MINEUR | 9 composants | Jamais importés : `AddToCartButton`, `Gallery`, `MainNav`, `MobileNavWrapper`, `ProductGallery`, `ProductInfo`, `QuantityController`, `VariantSelector`, `WhatsAppButton`. | Code mort. `WhatsAppButton` est trompeur : c'est `components/FloatingButtons.tsx` qui est réellement monté (`components/ClientOnlyComponents.tsx:9-27`). | Supprimer après vérification manuelle. | Faible — vérifier qu'aucun import dynamique par chaîne ne les référence. |
| 24 | MINEUR | `prisma/seed.ts` | Fichier de 0 octet. Aucune entrée `prisma.seed` dans `package.json`. | Fichier mort. | Supprimer. | Nul. |
| 25 | MINEUR | `prisma/schema.prisma:13-20, 96-97` | Modèle `User` et relation `Order.userId` → `prisma.user` n'est appelé nulle part (`grep prisma\.user` → 0). Le lien client se fait via `clerkUserId` (l.98). | Table `User` toujours vide ; jointure `Order.user` morte ; FK et index `Order_userId_idx` inutiles. | Laisser en l'état (retirer le modèle imposerait une migration destructive pour zéro gain). | Élevé si on supprime — ne pas y toucher. |
| 26 | MINEUR | `.env` vs code | Variables orphelines : `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (preset codé en dur `"ecommerce_preset"`, `components/admin/ImageUpload.tsx:141`), `FRONTEND_STORE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `DIRECT_URL` (inutilisé tant que #15 n'est pas corrigé). | Bruit de configuration ; le preset en dur ne peut pas varier par environnement. | Nettoyer `.env*` ; faire lire le preset depuis la variable. | Faible. |
| 27 | MINEUR | `.env`, `.env.local` | `NEXT_PUBLIC_WHATSAPP_NUMBER` n'est déclarée nulle part, alors qu'elle est lue 3 fois : `app/success/[orderId]/page.tsx:33`, `lib/send-order-email.ts:147`, `components/WhatsAppButton.tsx:10`. | Les 3 emplacements retombent sur le numéro en dur `+221 78 173 79 59` / `221781737959`. Changer de numéro impose de modifier 3 fichiers. | Déclarer la variable dans `.env.local` et sur Vercel. | Nul. |
| 28 | MINEUR | `prisma/migrations/20260512222448_add_indexes_and_unique_review/` | Le nom annonce « add indexes », mais le SQL est une **baseline complète** (`CREATE TYPE`, `CREATE TABLE User/Product/...`). | `prisma migrate deploy` sur une base déjà peuplée échouerait (`relation already exists`). Localement c'est passé car la migration est déjà marquée appliquée (`Database schema is up to date!`). | Sur toute nouvelle base, faire `prisma migrate resolve --applied` avant `deploy`. Ne pas renommer ni éditer la migration. | Élevé si on édite — ne pas toucher au SQL existant. |
| 29 | MINEUR | `lib/send-order-email.ts:150`, `lib/stock-alert.ts:77` | URL `https://www.maison-niang.fr` en dur dans le bouton « Suivre ma commande », alors que `NEXT_PUBLIC_APP_URL` existe et est utilisée 8 fois ailleurs. | Si le domaine change ou n'est pas encore branché, les liens des e-mails clients sont morts. | Utiliser `process.env.NEXT_PUBLIC_APP_URL`. | Nul. |
| 30 | MINEUR | 10 emplacements | `<img>` au lieu de `next/image` : `app/account/orders/page.tsx:145`, `app/admin/products/page.tsx:159`, `app/wishlist/page.tsx:60`, `components/admin/ImageUpload.tsx:89`, `components/CategoryMenu.tsx:110`, `components/home/BrandStory.tsx:51`, `components/home/CategoryShowcase.tsx:119`, `components/home/HeroSection.tsx:119`, `components/product/ProductGallery.tsx:50,68`. | Pas d'optimisation ni de lazy-loading ; LCP dégradé sur la home (`HeroSection`). Ne casse rien — les domaines sont autorisés (`next.config.js:8-19`). | Migrer vers `CustomImage` / `next/image` au cas par cas. | Faible. |
| 31 | MINEUR | `middleware.ts` | Le build affiche : *« The "middleware" file convention is deprecated. Please use "proxy" instead »*. | Avertissement Next 16 uniquement ; fonctionne encore (`ƒ Proxy (Middleware)` dans la sortie de build). | Renommer en `proxy.ts` lors d'une passe de maintenance. | Moyen — le renommage touche la route la plus critique du projet. |
| 32 | COSMÉTIQUE | `app/success/[orderId]/page.tsx` | 29 classes claires en dur (`bg-gray-50`, `bg-white`, `text-gray-900`…), **zéro** classe `dark:`. | La page reste blanche en mode sombre. Lisible, mais incohérente avec le reste du site. | Basculer sur les tokens `bg-background` / `text-foreground` déjà utilisés ailleurs. | Faible. |
| 33 | COSMÉTIQUE | `app/checkout/page.tsx:199-325` | La colonne gauche (formulaire + paiement) est figée en clair (`bg-gray-50`, `text-gray-900`) alors que les champs utilisent `bg-background text-foreground` (l.215, 228…) et que la colonne droite gère le sombre (l.351). | En mode sombre : champs sombres dans des cartes claires. Lisible mais disgracieux, sur la page la plus sensible du tunnel. | Ajouter les variantes `dark:` ou passer aux tokens. | Faible. |

---

## Détail par axe

### 1. Configuration

**Trois `next.config` — c'est `next.config.js` qui gagne.**

L'ordre est codé en dur dans Next 16 :

```js
// node_modules/next/dist/shared/lib/constants.js:359
const CONFIG_FILES = [
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
```

Confirmé empiriquement : le build affiche `Skipping validation of types`, ce qui n'est possible que si `typescript.ignoreBuildErrors: true` est chargé — présent dans `.js` et `.mjs`, absent de `.ts`.

| Fichier | Contenu | Chargé ? |
|---|---|---|
| `next.config.js` | `typescript.ignoreBuildErrors: true` + `images.remotePatterns` (`res.cloudinary.com`, `images.unsplash.com`) | ✅ **oui** |
| `next.config.mjs` | strictement identique au `.js` | ❌ ignoré |
| `next.config.ts` | `reactCompiler: true` — **rien d'autre** | ❌ ignoré |

Conséquence : React Compiler n'est jamais activé, et `babel-plugin-react-compiler` (`package.json:38`) est inerte. En revanche, les `remotePatterns` Cloudinary sont bien chargés — aucun problème d'images côté configuration.

**`tsconfig.json`** — `strict: true`, `paths: {"@/*": ["./*"]}`, `moduleResolution: "bundler"`. Cohérent, rien à signaler.

**`postcss.config.mjs`** — `@tailwindcss/postcss` seul, conforme à Tailwind 4.

**`.eslintignore`** — contient `*`. Ignoré par ESLint 9 de toute façon (avertissement `ESLintIgnoreWarning` au lancement).

**`middleware.ts` (matcher, l.42-49)** — le matcher est correct : il exclut `_next` et les assets, et force `/(api|trpc)(.*)`. Le build confirme `ƒ Proxy (Middleware)`.

**Variables d'environnement.** Next charge les deux fichiers, `.env.local` prioritaire — le build l'indique : `Environments: .env.local, .env`.

| Variable | `.env` | `.env.local` | Utilisée dans le code |
|---|:---:|:---:|---|
| `DATABASE_URL` | ✅ (`:5432`) | ✅ (`:6543?pgbouncer=true`) | `prisma/schema.prisma:9` |
| `DIRECT_URL` | ✅ | ✅ (hôte **différent**) | ❌ (commentée, `schema.prisma:10`) |
| `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | ✅ | via `@clerk/nextjs` |
| `RESEND_API_KEY` | ✅ | ✅ | 9 usages |
| `RESEND_FROM_EMAIL` | ❌ | ✅ | 5 usages |
| `ADMIN_EMAIL` | ❌ | ✅ | `webhook/route.ts:95`, `send-order-email.ts:178`, `stock-alert.ts:21` |
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | 8 usages |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | ❌ | Jamais dans *votre* code, mais **requise** par `next-cloudinary` |
| **`ADMIN_USER_IDS`** | ❌ | ❌ | `middleware.ts:4`, `lib/auth.ts:4` → **manquante** |
| **`NEXT_PUBLIC_WHATSAPP_NUMBER`** | ❌ | ❌ | 3 usages → **manquante** |
| **`ALLOW_RESET_DB`** | ❌ | ❌ | `reset-db/route.ts:12` → manquante (comportement voulu : la garde reste active) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ✅ | ❌ | **orpheline** (preset en dur `ImageUpload.tsx:141`) |
| `FRONTEND_STORE_URL` | ✅ | ✅ | **orpheline** |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | ✅ | ✅ | seulement `webhook/route.ts:8,21` (code mort, axe 7) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | ✅ | **orpheline** |
| `VERCEL_OIDC_TOKEN` | ❌ | ✅ | injectée par Vercel |

Point de vigilance sur `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` : `next-cloudinary` lève une exception si elle est absente —

```js
// node_modules/next-cloudinary/dist/index.js
if(!t) throw new Error("A Cloudinary Cloud name is required, please make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set...")
```

`components/ui/CustomImage.tsx:41-55` rend un `<CldImage>` pour **toute** URL Cloudinary. Si la variable manque sur Vercel, toutes les fiches produit plantent. Elle n'est présente que dans `.env` (non déployé, car `.env*` est gitignoré).

Aucun secret en dur trouvé : `grep -rnE "(sk_live|sk_test|re_…|whsec_|pk_live|postgresql://)"` sur `app/ components/ lib/ hooks/ actions/ prisma/` → **0 résultat**. Aucun `.env` n'est versionné (`git ls-files | grep ^\.env` → vide). Aucune variable sensible n'est préfixée `NEXT_PUBLIC_`.

### 2. État Git

`main` local et `origin/main` sont sur le **même commit** `61d38d9` : `git rev-list --left-right --count origin/main...HEAD` → `0	0`. Tout l'écart est donc dans le répertoire de travail.

**Fichiers non suivis (6) — aucun n'est dans `origin/main`** (vérifié par `git cat-file -e origin/main:<chemin>`) :

```
lib/auth.ts                ABSENT
lib/logger.ts              ABSENT
lib/rate-limit.ts          ABSENT
lib/validations/promo.ts   ABSENT
lib/validations/review.ts  ABSENT
prisma/migrations/         ABSENT
```

**Fichiers modifiés non commités : 26.**

**Le diff dépend du git qui le lit.** Le git Windows du poste (`C:/Program Files/Git`, autocrlf=true dans le gitconfig système) normalise les CRLF et voit 26 fichiers modifiés / 1068 lignes, dont 6 lignes seulement de bruit de fin de ligne. Un git sans ce réglage — shell Linux, CI, autre machine — voit les mêmes fichiers comme 58 fichiers / 53 765 lignes, parce que l'index est en LF et le disque en CRLF. Les deux mesures sont exactes, elles ne regardent pas la même chose.

Le `.gitattributes` ajouté au commit `aeed485` (`* text=auto eol=lf`) supprime cette ambiguïté : toute copie du dépôt est désormais lue de la même façon. Contrôle croisé : le commit `47f0404` contient 667 ajouts / 401 suppressions, ce qui recoupe la mesure indépendante faite sous l'autre git (664/398, l'écart de 3 lignes étant dû à `--ignore-cr-at-eol` qui masque des modifications réelles de fin de ligne). Le contenu commité est donc bien le changement de code réel, sans bruit.

**Les 26 fichiers ont tous de vraies modifications** — aucun n'est un faux positif :

`app/api/admin/export-csv/route.ts` (+4), `app/api/admin/orders/[orderId]/route.ts` (19), `app/api/admin/orders/export/route.ts` (8), `app/api/admin/promos/[promoId]/route.ts` (14), `app/api/admin/promos/route.ts` (52), `app/api/admin/reset-db/route.ts` (81), `app/api/categories/route.ts` (39), `app/api/checkout/custom/route.ts` (272), `app/api/products/[productId]/route.ts` (72), `app/api/products/route.ts` (87), `app/api/promo/validate/route.ts` (33), `app/api/reviews/route.ts` (92), `app/api/webhook/route.ts` (80), `app/checkout/page.tsx` (24), `app/search/page.tsx` (4), `components/ProductCard.tsx` (4), `components/admin/ProductForm.tsx` (+8), `components/home/BrandStory.tsx` (2), `components/home/ProductsCollection.tsx` (+1), `components/product/ProductClient.tsx` (4), `hooks/use-cart.ts` (+1), `lib/send-order-email.ts` (58), `lib/validations/checkout.ts` (33), `lib/validations/product.ts` (21), `middleware.ts` (42), `prisma/schema.prisma` (+13).

**Ce qui tourne en production sans contrôle admin.** `origin/main:middleware.ts` :

```ts
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();   // authentifié — PAS admin
  }
});
```

Et le contenu réel des routes déployées (`git show origin/main:<fichier>`) :

| Route déployée | Contrôle dans le fichier | Contrôle réel |
|---|---|---|
| `GET /api/admin/reset-db` | **aucun** | connecté suffit → **destruction totale** |
| `GET /api/admin/export-csv` | **aucun** | connecté suffit → fuite PII |
| `GET /api/admin/orders/export` | `if (!userId) 401` | connecté suffit → fuite PII |
| `PATCH /api/admin/orders/[orderId]` | `if (!userId) 401` | connecté suffit → marquer payé |
| `POST`/`GET /api/admin/promos` | `if (!userId) 401` | connecté suffit |
| `DELETE`/`PATCH /api/admin/promos/[promoId]` | `if (!userId) 401` | connecté suffit |
| `POST /api/products` | `if (!userId) 403` | connecté suffit |
| `PATCH`/`DELETE /api/products/[productId]` | `if (!userId) 403` | connecté suffit |
| `POST /api/categories` | **aucun** | connecté suffit |
| `/admin` (UI) | `app/admin/layout.tsx` est `'use client'`, sans garde | connecté suffit |

Aucune de ces routes ne teste un rôle. Le `sessionClaims.metadata.role` et `ADMIN_USER_IDS` n'existent que dans le `middleware.ts` **local, non commité** (l.24-39).

### 3. Compilation et types

**`npx tsc --noEmit` → exit 0, sortie vide. Zéro erreur, tous fichiers confondus.** Exécuté deux fois pour écarter un artefact de pipeline : `TSC_EXIT=0`, `0` ligne de sortie.

**`npm run lint` → exit 2, échec total :**

```
(node:1424) ESLintIgnoreWarning: The ".eslintignore" file is no longer supported.
Oops! Something went wrong! :(
ESLint: 9.39.2
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
```

Il n'y a aucun `eslint.config.*` ni `.eslintrc.*` à la racine. Le lint n'a donc jamais tourné depuis la montée en ESLint 9.

**`npm run build` → succès.**

```
▲ Next.js 16.1.4 (Turbopack)
- Environments: .env.local, .env
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
✓ Compiled successfully in 22.5s
  Skipping validation of types
✓ Generating static pages using 7 workers (34/34) in 6.1s
```

44 routes générées, aucune erreur. **`Skipping validation of types` confirme que le build ne doit rien à `tsc`** : il passe uniquement grâce à `typescript.ignoreBuildErrors: true` (`next.config.js:4`). Ici c'est sans conséquence puisque `tsc` est propre — mais le filet est bel et bien retiré.

Note : le build a exécuté une vingtaine de requêtes `SELECT ... FROM "Category"` en base pendant la génération statique — comportement normal des pages dynamiques, mais cela signifie qu'un build Vercel exige une base joignable.

### 4. Base de données

**`npx prisma validate`** → `The schema at prisma\schema.prisma is valid 🚀`

**`npx prisma migrate status`** →
```
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-1-eu-west-1.pooler.supabase.com:5432"
1 migration found in prisma/migrations
Database schema is up to date!
```

Le CLI Prisma a chargé `.env` (« Environment variables loaded from .env »), **pas** `.env.local` — d'où le port `5432`. C'est ce qui masque le problème suivant.

**`directUrl` commenté — conséquences concrètes.**

```prisma
// prisma/schema.prisma:7-11
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  // directUrl = env("DIRECT_URL")
}
```

Sans `directUrl`, `prisma migrate` et `prisma db push` utilisent `DATABASE_URL`. Or les deux fichiers ne pointent pas au même endroit :

| | `DATABASE_URL` |
|---|---|
| `.env` | `...pooler.supabase.com:5432/postgres` (pooler **session**) |
| `.env.local` | `...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` (pooler **transaction**) |

1. **Migrations.** Tant que le CLI lit `.env`, tout fonctionne (port 5432 = mode session, compatible). Mais si `.env` disparaît, ou si `DATABASE_URL` est aligné sur le 6543, les migrations casseront : pgbouncer en mode transaction ne supporte ni les advisory locks utilisés par le shadow database, ni les prepared statements. Message typique : `prepared statement "s0" already exists`.
2. **Runtime serverless.** Là, la configuration est **correcte** : `?pgbouncer=true&connection_limit=1` est exactement ce que Supabase recommande pour Vercel, et c'est bien `.env.local` que Next charge en priorité. Chaque lambda ouvre une connexion, le pooler absorbe la concurrence.
3. Le vrai risque est donc **la divergence silencieuse** entre l'URL vue par le CLI et celle vue par l'application, aggravée par le fait que `DIRECT_URL` lui-même diffère entre les deux fichiers (`...pooler...:5432` vs `db.<ref>.supabase.co:5432`).

**Cohérence schéma ↔ migrations.** Une seule migration, `20260512222448_add_indexes_and_unique_review`. Malgré son nom, c'est une **baseline complète** : `CREATE TYPE "PaymentMethod"`, `CREATE TABLE "User"`, `"Product"`, `"Category"`, `"Image"`, `"Order"`, `"OrderItem"`, `"PromoCode"`, `"Review"`, puis les 16 index et 6 clés étrangères. Le contenu correspond exactement au `schema.prisma` actuel (y compris `isFreeShipping`, `gender`, `shippingCost`, `discount`, `promoCode`, et l'unique `Review_productId_clerkUserId_key`). Rien ne manque — mais sur une base neuve il faudra `prisma migrate resolve --applied` avant tout `deploy`, sinon `relation "User" already exists`.

**Champs du schéma non utilisés par le code :**

| Élément | Constat |
|---|---|
| `model User` (l.13-20) | `grep "prisma\.user"` → **0 résultat**. Table toujours vide. |
| `Order.userId` / `Order.user` (l.96-97) | Jamais renseignés ; le lien client passe par `clerkUserId` (l.98). L'index `Order_userId_idx` est inutile. |
| `Image.color` (l.68) | **Utilisé** : `components/product/ProductClient.tsx:58` (`product.images.find(img => img.color === selectedColor)`). |
| `Product.originalPrice`, `isFreeShipping`, `gender` | **Utilisés** (10 fichiers, 9 fichiers, plusieurs). |
| `PromoCode.minOrderAmount` | **Utilisé** : `app/api/promo/validate/route.ts:37`. |

Inversement, aucun champ n'est lu par le code sans exister au schéma (`tsc` le confirme).

### 5. Parcours d'achat

Chemin tracé : `ProductClient` → `use-cart` → `/cart` → `/checkout` → `POST /api/checkout/custom` → transaction Prisma → e-mails → `/success/[orderId]`.

**Cohérence des prix — le modèle est sain, sauf à l'arrivée.**

Tout le parcours manipule des **EUR** et ne convertit qu'à l'affichage via `lib/currency.ts:27` (`Math.round(price * 655.957)`). Vérifié point par point :

- `components/product/ProductClient.tsx:81` → `price: Number(product.price)` (EUR) dans le panier ;
- `app/checkout/page.tsx:75-77` → `subtotalEur` en EUR ; `shippingEur = 4.57` / `22.87` (l.97, 103), commentés « ~3000 FCFA » / « ~15000 FCFA » — cohérent ;
- `app/api/promo/validate/route.ts:43-49` → `discountEur` renvoyé en EUR, message minimum affiché en EUR (l.39) ;
- `app/api/checkout/custom/route.ts:145-148` → `subtotal` recalculé **depuis la base**, `finalTotal = subtotal + shipping - discount` ✅ ;
- `lib/send-order-email.ts:37-41` → `formatCFA()` convertit EUR→FCFA une seule fois ✅ ;
- `app/api/admin/orders/export/route.ts:36-39` → conversion unique ✅ ;
- `lib/mail.ts:21` → `formatPrice(totalAmountInEur)` ✅.

**Aucune double conversion ni inversion EUR/FCFA trouvée.** Le seul piège dormant est `lib/format.ts:9-12`, dont le `formatPrice` traite son argument comme déjà en XOF — mais il n'est importé nulle part (anomalie #19).

**En revanche, trois totaux sont tronqués** (anomalies #4, #6, #7, #8) :

| Emplacement | Formule | Correct ? |
|---|---|---|
| `app/api/checkout/custom/route.ts:148` (e-mails) | `subtotal + shipping - discount` | ✅ |
| `app/api/admin/orders/[orderId]/route.ts:46` | `subtotal + shipping - discount` | ✅ |
| `app/admin/orders/page.tsx:140` | `subtotal + shipping - discount` | ✅ |
| `app/api/admin/orders/export/route.ts:39` | `subtotalXOF + shippingXOF - discountXOF` | ✅ |
| **`app/success/[orderId]/page.tsx:54`** | `subtotal` seul | ❌ |
| **`app/account/orders/page.tsx:72`** | `subtotal` seul | ❌ |
| **`app/admin/page.tsx:30, 42`** | `subtotal` seul | ❌ |
| **`app/api/admin/export-csv/route.ts:21`** | `subtotal` seul | ❌ |

Le plus grave est `/success/[orderId]` : ce montant est présenté comme la somme à transférer sur Wave (l.109), Orange Money (l.127), PayPal (l.146 et 154) ou en espèces (l.170).

**Double décrément du stock : impossible aujourd'hui.**

`app/api/checkout/custom/route.ts:62-79` décrémente dans une transaction, avec garde anti-survente :

```ts
const result = await tx.product.updateMany({
  where: { id: item.id, isArchived: false, stock: { gte: item.quantity } },
  data: { stock: { decrement: item.quantity } },
})
if (result.count === 0) throw new CheckoutBusinessError(...)
```

`app/api/webhook/route.ts:68-81` décrémente une seconde fois. Mais le webhook ne se déclenche que sur `checkout.session.completed` avec `session.metadata.orderId` (l.31) — et **aucune session Stripe n'est créée dans le projet** (voir axe 7). La signature (l.18-22) empêche par ailleurs tout déclenchement forgé. Le webhook contient en plus une garde d'idempotence sur `isPaid` (l.48-51). Conclusion : risque nul en l'état, mais armé si Stripe revient.

**`usedCount` du code promo.** Incrémenté dans la transaction de création (l.82-89), quota vérifié après coup (l.94-100). Aucun décrément n'existe ailleurs — `grep usedCount` ne renvoie que cette ligne et des lectures (`promo/validate/route.ts:34`, `promo/active/route.ts:25`). Donc : une commande `PENDING` jamais payée, ou passée en `CANCELLED` par l'admin (`app/api/admin/orders/[orderId]/route.ts:27-29`), **consomme définitivement une utilisation**. Un code `maxUses: 100` peut être épuisé sans une seule vente.

**Vidage du panier et double soumission.** `cart.clearCart()` est appelé à la ligne 171 de `app/checkout/page.tsx`, **après** la réponse OK, avant la redirection. Comportements :

- *Rechargement de `/checkout`* : `useEffect` l.66-70 redirige vers `/cart` si le panier est vide, et `if (cart.items.length === 0) return null` (l.73) empêche tout rendu intermédiaire. Correct.
- *Double soumission* : le bouton est `disabled={loading}` (l.330) et `loading` passe à `true` dès l'entrée dans `onSubmit` (l.143). Protection raisonnable côté client ; côté serveur, seul le rate-limit (10 req/min, `custom/route.ts:17`) borne les abus — et il est peu fiable en serverless (#18).
- *Cas dégradé réel* : si la requête aboutit mais que la réponse se perd (réseau mobile), `clearCart()` n'est pas appelé, la commande existe, le stock et le `usedCount` sont consommés, et le client peut resoumettre → seconde commande.

**Frais de port et remise : l'API fait aveuglément confiance au client.** C'est le point le plus important de cet axe (anomalie #5).

```ts
// app/checkout/page.tsx:158-160 — calcul 100 % client
promoCode: appliedPromo?.code || null,
discount: discountEur,
shippingCost: shippingEur
```
```ts
// lib/validations/checkout.ts:33-34 — Zod ne contrôle que le signe
discount: z.number().min(0).optional(),
shippingCost: z.number().min(0).optional(),
```
```ts
// app/api/checkout/custom/route.ts:114-115 — écriture directe en base
discount: discount || 0,
shippingCost: shippingCost || 0,
```

L'API ne rejoue **ni** la grille de villes (`app/checkout/page.tsx:88-105`), **ni** le calcul de remise de `/api/promo/validate`. Elle vérifie uniquement que le code promo existe, est actif et non expiré (l.82-89) — jamais que le montant de remise annoncé lui correspond. Un POST direct avec `discount: 99999` est accepté.

Atténuation : le **prix des articles** est toujours recalculé depuis la base (l.145-147), donc le sous-total est incorruptible. Seuls le total facturé, les e-mails et les exports comptables sont faussables.

### 6. Admin et sécurité

**Inventaire complet des routes.** « Middleware » = couvert par `isProtectedRoute` (`middleware.ts:9-14`). Colonne « Production » = ce qui s'applique réellement sur `origin/main`.

| Route | Méthode | Garde dans le fichier (local) | Middleware | **Production (`origin/main`)** |
|---|---|---|---|---|
| `/api/admin/reset-db` | POST (GET en prod) | `requireAdmin()` + `confirm` + `ALLOW_RESET_DB` | ✅ | ⛔ **connecté suffit, GET, aucune confirmation** |
| `/api/admin/export-csv` | GET | `requireAdmin()` (l.6) | ✅ | ⛔ connecté suffit |
| `/api/admin/orders/export` | GET | `requireAdmin()` (l.7) | ✅ | ⛔ connecté suffit |
| `/api/admin/orders/[orderId]` | PATCH | `requireAdmin()` (l.13) | ✅ | ⛔ connecté suffit |
| `/api/admin/promos` | POST, GET | `requireAdmin()` (l.10, 50) | ✅ | ⛔ connecté suffit |
| `/api/admin/promos/[promoId]` | DELETE, PATCH | `requireAdmin()` (l.12, 34) | ✅ | ⛔ connecté suffit |
| `/api/products` | GET | aucune | ✅ (bloque le GET public) | authentification requise |
| `/api/products` | POST | `requireAdmin()` (l.58) | ✅ | ⛔ connecté suffit |
| `/api/products/[productId]` | GET | aucune | ✅ | authentification requise |
| `/api/products/[productId]` | PATCH, DELETE | `requireAdmin()` (l.13, 71) | ✅ | ⛔ connecté suffit |
| `/api/categories` | POST | `requireAdmin()` (l.8) | ❌ | ⛔ **aucun contrôle du tout** |
| `/api/categories` | GET | aucune (voulu) | ❌ | public ✅ |
| `/api/checkout/custom` | POST | rate-limit (l.17), `auth()` facultatif | ❌ | public ✅ (voulu) |
| `/api/checkout` | POST | stub 308 | ❌ | public, inoffensif |
| `/api/promo/validate` | POST | rate-limit 20/min (l.9) | ❌ | public ✅ |
| `/api/promo/active` | GET | aucune | ❌ | public ✅ |
| `/api/reviews` | POST | rate-limit 5/min + `requireAuth()` (l.10-14) | ❌ | connecté ✅ |
| `/api/reviews` | GET | aucune, filtre `isApproved: true` (l.81) | ❌ | public ✅ |
| `/api/search` | GET | aucune | ❌ | public ✅ |
| `/api/webhook` | POST | signature Stripe (l.18-22) | ❌ | signature ✅ |
| `/test-mail` | GET | **aucune** | ❌ | ⛔ **public — envoie un vrai e-mail** |
| `/admin/*` (pages) | — | `app/admin/layout.tsx` est `'use client'`, **aucune garde serveur** | ✅ | ⛔ connecté suffit |
| `/account/orders` | — | `auth()` + `redirect` (l.27-28) | ✅ | connecté ✅ |

Deux remarques :
- `/api/categories` POST n'est **pas** couvert par le middleware (`isProtectedRoute` ne liste que `/admin`, `/api/admin`, `/api/products`, `/account`). En production, la version déployée n'a aucun `auth()` : **n'importe qui, sans compte, peut créer des catégories**.
- `/api/products` GET est bloqué par le middleware alors que c'est une API de listing publique paginée. Sans conséquence visible — aucun code client ne l'appelle (seuls `components/admin/*` et `ProductForm.tsx` y touchent) — mais la capacité est morte.

**Rate limiter sur Vercel serverless.** `lib/rate-limit.ts:11` : `const buckets = new Map<string, Bucket>()`, en mémoire de processus. Sur Vercel :
- chaque instance de lambda possède sa propre `Map` → avec N instances chaudes, la limite effective est `limit × N` ;
- un cold start repart d'une `Map` vide → le compteur est remis à zéro ;
- le trafic n'est pas routé par IP, donc deux requêtes du même client tombent rarement sur la même instance ;
- le GC opportuniste (l.50-54) ne se déclenche qu'au-delà de 5 000 clés, ce qui n'arrivera pratiquement jamais par instance.

Conclusion : protection réelle proche de zéro contre un attaquant, utile seulement contre un double-clic. Le fichier le dit lui-même (l.4-8) et donne la migration Upstash.

**Fuites de secrets : aucune trouvée.** Voir axe 1. Le seul « secret » exposé est `PAYMENT_NUMBER` (`app/success/[orderId]/page.tsx:33`) et le lien `paypal.me/maisonniang` (l.149) — des données commerciales publiques, pas des secrets.

**`/api/admin/reset-db` — ce qu'elle fait exactement.**

Version **locale** (`app/api/admin/reset-db/route.ts:33-41`) : `POST`, puis `prisma.$transaction` de 6 `deleteMany({})` sur `orderItem`, `order`, `image`, `review`, `product`, `category`. Table `User` épargnée. Protégée par `requireAdmin()` (l.9), garde de production (l.12-17) et token `confirm: 'RESET'` (l.26-31).

Version **déployée** (`origin/main`) : `GET`, sans aucune garde, mêmes suppressions. **Atteignable par tout utilisateur connecté** (anomalie #2). C'est la vulnérabilité la plus grave du projet.

### 7. Paiement

**Aucune session Stripe n'est créée nulle part.** Recherche exhaustive de `stripe`/`Stripe` sur `app/ lib/ components/ actions/ hooks/` :

```
app/api/webhook/route.ts:2   import Stripe from 'stripe'
app/api/webhook/route.ts:8   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, ...)
app/api/webhook/route.ts:13  req.headers.get('stripe-signature')
app/api/webhook/route.ts:18  stripe.webhooks.constructEvent(...)
app/api/webhook/route.ts:29  event.data.object as Stripe.Checkout.Session
components/product/ProductClient.tsx:350  <span>Stripe & SSL</span>   ← texte marketing
app/api/admin/export-csv/route.ts:29      // commentaire obsolète
```

Pas un seul `stripe.checkout.sessions.create`. `app/api/checkout/route.ts` — l'ancien point d'entrée — n'est plus qu'un stub qui renvoie 308 (l.5-9).

**Comment une commande passe-t-elle de `PENDING` à payée ? Uniquement à la main par l'admin.** Le seul chemin est `app/api/admin/orders/[orderId]/route.ts:25-29` :

```ts
const isPaid = ['PAYMENT_RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)
const order = await prisma.order.update({ where: { id: orderId }, data: { status, isPaid } })
```

Déclenché depuis `components/admin/OrderStatusSelect.tsx:29`. Le client transfère sur Wave / Orange Money / PayPal en citant la référence affichée sur `/success/[orderId]`, l'admin vérifie sur son téléphone, puis bascule le statut. C'est cohérent avec le modèle économique — mais cela rend l'anomalie #4 critique, puisque le montant affiché au client est le seul contrat de paiement.

**Code Stripe mort à supprimer :**

| Élément | Emplacement |
|---|---|
| Toute la route webhook (104 lignes) | `app/api/webhook/route.ts` |
| Dépendance `stripe@^20.2.0` | `package.json:32` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env`, `.env.local` |
| Stub 308 | `app/api/checkout/route.ts` |
| Commentaire obsolète | `app/api/admin/export-csv/route.ts:29` |
| Mention marketing « Stripe & SSL » | `components/product/ProductClient.tsx:350` — trompeuse, aucun paiement par carte n'est traité |
| Dépendance `paystack-api@^2.0.6` | `package.json:29` — **zéro** occurrence dans le code |
| Binaire CLI | `stripe.exe`, 31,6 Mo |

**`stripe.exe` est-il versionné ? Oui.** `git ls-files --error-unmatch stripe.exe` → présent ; `git cat-file -s HEAD:stripe.exe` → **31 663 616 octets**. Idem pour `structure.txt` (1 864 204 octets). Le `.git` fait 9,3 Mo au total (bonne compression), mais ces deux fichiers n'ont rien à faire dans le dépôt.

### 8. Cohérence UI

**Composants jamais importés (9)** — détectés en croisant chaque nom de fichier de `components/` avec l'ensemble des imports de `app/ components/ lib/ hooks/ actions/` :

`AddToCartButton`, `Gallery`, `MainNav`, `MobileNavWrapper`, `ProductGallery`, `ProductInfo`, `QuantityController`, `VariantSelector`, `WhatsAppButton`.

Cas particulier de `WhatsAppButton.tsx` : c'est `components/FloatingButtons.tsx` qui est réellement monté, via l'import dynamique de `components/ClientOnlyComponents.tsx:9-10` — le bouton WhatsApp visible sur le site ne vient donc pas de ce fichier.

**Routes en double ou incohérentes :**

| Cas | Constat |
|---|---|
| `app/retours` vs `app/returns` | Deux pages complètes, contenus différents (`retours` : « retours sous 7 jours » ; `returns` : mise en page marketing distincte). Les deux sont buildées (`○ /retours`, `○ /returns`). Seul `/retours` est lié — `components/Footer.tsx:18`. |
| `app/success` vs `app/success/[orderId]` | La page statique `/success` génère un faux numéro de commande (`app/success/page.tsx:18`), affirme « Votre paiement a été confirmé » (l.55) et vide le panier (l.21). Elle n'est jamais atteinte par le code (`app/checkout/page.tsx:174` redirige vers `/success/${data.orderId}`), mais l'URL publique existe. |
| `app/api/categories/ProductCard.tsx` | Composant React dans un dossier d'API. Next ne l'expose pas comme route (seuls `route.ts`/`page.tsx` en sont), donc il est inoffensif — mais il n'est importé nulle part et pointe vers `/product/${data.id}` (l.20), une route qui n'existe pas (les fiches produit sont sous `/products/[id]`). |

**Dark mode.** Pages sans **aucune** classe `dark:`, avec le compte d'occurrences de classes claires en dur :

| Page | Classes claires en dur | Verdict |
|---|---|---|
| `app/success/[orderId]/page.tsx` | **29** | Page entièrement blanche en mode sombre (anomalie #32) |
| `app/search/page.tsx` | 3 | négligeable |
| `app/products/[id]/page.tsx` | 2 | négligeable |
| `app/cart/page.tsx` | 1 | négligeable (spinner) |
| toutes les autres (`/admin/*`, `/cgv`, `/contact`, `/category/[id]`, `/products`, `/returns`, `(auth)/*`…) | 0 | ✅ tokens uniquement |

`app/checkout/page.tsx` est un cas mixte : la colonne droite gère le sombre (l.351, 356, 360, 385, 404, 441), la colonne gauche est figée en clair (l.199, 200, 207, 220, 233, 245, 258, 273, 274, 304, 317, 320) alors que les champs de saisie utilisent `bg-background text-foreground` (anomalie #33). Lisible, mais visuellement incohérent sur la page la plus sensible du tunnel.

**Images.** 10 usages de `<img>` au lieu de `next/image` (liste en anomalie #30). Aucun **domaine non autorisé** : `next.config.js:8-19` déclare `res.cloudinary.com` et `images.unsplash.com`, et `components/ui/CustomImage.tsx:41-70` route correctement vers `CldImage` ou `next/image` selon l'origine. Le fallback local `/placeholder.jpg` est utilisé en plusieurs endroits (ex. `app/checkout/page.tsx:362`) — vérifier sa présence dans `public/`.

---

## Ce qui fonctionne

Vérifié et correct :

- **TypeScript** : `npx tsc --noEmit` → **0 erreur**, exit 0, sortie vide (exécuté deux fois).
- **Build** : `npm run build` → succès en 22,5 s, 44 routes générées, 34 pages statiques, aucune erreur ni avertissement bloquant.
- **Prisma** : `prisma validate` → schéma valide ; `prisma migrate status` → « Database schema is up to date! », 1 migration, aucune dérive.
- **Cohérence schéma ↔ migration** : les 9 modèles, 2 enums, 16 index et 6 clés étrangères du SQL correspondent exactement à `schema.prisma`. Aucun champ manquant dans un sens ou dans l'autre.
- **Modèle monétaire** : la base stocke des EUR (`Decimal`), la conversion FCFA se fait une seule fois à l'affichage (`lib/currency.ts:27`). **Aucune double conversion, aucune inversion EUR↔FCFA** dans le parcours d'achat, les e-mails ou l'export CSV principal.
- **Prix des articles incorruptible** : `app/api/checkout/custom/route.ts:145-147` recalcule systématiquement le sous-total depuis la base ; le prix envoyé par le client n'est jamais utilisé.
- **Anti-survente** : `custom/route.ts:64-78` utilise `updateMany` avec garde `stock: { gte: quantity }` et vérifie `result.count === 0` — corrige la condition de course. Toute la transaction (stock + promo + commande) est atomique, en `ReadCommitted` (l.129).
- **Idempotence du webhook** : `webhook/route.ts:40-51` court-circuite si `isPaid` est déjà vrai.
- **Quota promo** : vérifié après incrément dans la transaction, avec rollback si dépassement (`custom/route.ts:94-100`).
- **Validation Zod** : en place sur checkout (`lib/validations/checkout.ts`), produits, promos, avis — avec `flattenError` pour des messages exploitables.
- **Unicité des avis** : contrainte `@@unique([productId, clerkUserId])` (`schema.prisma:162`) présente en base ; `/api/reviews` GET ne renvoie que `isApproved: true` (l.81).
- **Panier** : plafonnement au stock à l'ajout (`hooks/use-cart.ts:46-53`) et à la mise à jour (l.95-99) ; `cartId` composite `id-taille-couleur` (l.40) pour distinguer les variantes ; persistance localStorage.
- **Vidage du panier** : effectif après commande réussie (`app/checkout/page.tsx:171`), et le rechargement de `/checkout` redirige proprement vers `/cart` (l.66-73).
- **Totaux corrects** dans les e-mails (`custom/route.ts:148`), sur `/admin/orders` (l.140), dans `/api/admin/orders/export` (l.39) et sur le changement de statut admin (`orders/[orderId]/route.ts:46`).
- **Aucun secret en dur**, aucun `.env` versionné, aucune variable sensible préfixée `NEXT_PUBLIC_`.
- **Configuration serverless de la base correcte** : `.env.local` utilise bien `pgbouncer=true&connection_limit=1` sur le port 6543, et `lib/prisma.ts:12` met en cache le client hors production.
- **`/account/orders`** correctement protégée côté serveur (`auth()` + `redirect`, l.27-28) et filtrée sur `clerkUserId` (l.32).
- **Dark mode déjà propre** sur 15 des 17 pages testées, y compris tout l'espace admin.
- **`images.remotePatterns`** bien configurés pour Cloudinary et Unsplash dans le fichier de config réellement chargé.

---

## Zones d'incertitude

Ce que je n'ai pas pu vérifier sans exécuter l'application ni accéder à Vercel :

1. **Variables d'environnement réellement définies sur Vercel.** `.env` et `.env.local` sont gitignorés et ne sont pas déployés. Je ne peux pas savoir si `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `ADMIN_EMAIL`, `RESEND_FROM_EMAIL` ou `ADMIN_USER_IDS` existent côté Vercel. *Pour lever le doute :* `vercel env ls`, ou l'onglet Settings → Environment Variables. **Point critique** : sans `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `next-cloudinary` lève une exception et toutes les images produit plantent.

2. **Rôle admin dans Clerk.** Je ne peux pas inspecter `publicMetadata.role` des comptes. Si aucun compte ne porte `role: "admin"` et que `ADMIN_USER_IDS` reste vide, déployer le nouveau `middleware.ts` verrouille `/admin` pour tout le monde. *Pour lever le doute :* dashboard Clerk → Users → Metadata, avant tout déploiement.

3. **La base de production a-t-elle déjà été vidée ?** Vu l'anomalie #2, il faut vérifier l'historique. *Pour lever le doute :* `SELECT count(*) FROM "Order"` et les logs Vercel sur `/api/admin/reset-db`.

4. **Quel `DIRECT_URL` est le bon ?** `.env` pointe sur `aws-1-eu-west-1.pooler.supabase.com:5432`, `.env.local` sur `db.<ref>.supabase.co:5432`. Les deux sont des formes valides de connexion directe Supabase, mais je ne sais pas laquelle correspond au projet actif. *Pour lever le doute :* Supabase → Project Settings → Database → Connection string.

5. **Comportement réel du tunnel d'achat.** Je n'ai lancé aucun serveur : je n'ai pas observé un ajout au panier, une validation de promo, une soumission de commande ni la réception d'un e-mail. Toutes mes conclusions de l'axe 5 sont issues de la lecture du code. *Pour lever le doute :* `npm run dev` puis un achat de bout en bout avec un code promo et une ville hors Dakar — c'est le test qui rendra l'anomalie #4 visible immédiatement.

6. **Delivrabilité Resend.** Je n'ai ni déclenché ni inspecté un envoi. Le domaine `maison-niang.fr` est-il vérifié chez Resend ? `RESEND_FROM_EMAIL` retombe sur `onboarding@resend.dev` (`lib/mail.ts:5`), qui ne permet d'écrire qu'à l'adresse du propriétaire du compte. *Pour lever le doute :* dashboard Resend → Domains.

7. **Volumétrie et index.** `migrate status` confirme que les index existent, mais je n'ai pas mesuré de plans d'exécution. Le `LIKE` insensible à la casse de `/api/search:16-18` n'utilisera aucun index — sans importance à petite échelle.

8. **Présence de `public/placeholder.jpg`.** Référencé comme fallback (ex. `app/checkout/page.tsx:362`) ; je n'ai pas listé le contenu de `public/`.

9. **Branche `design-update-v1`.** Elle existe (`ab2464b`, suivie sur `origin`) et je ne l'ai pas auditée. Si elle contient du travail non fusionné, il faudra arbitrer avant de commiter les 26 fichiers.

10. **Impact d'un `next.config.js` corrigé.** Passer `ignoreBuildErrors` à `false` est sûr *aujourd'hui* (`tsc` est vert), mais le build Vercel n'inclut pas les mêmes types générés que la machine locale (`.next/types`). *Pour lever le doute :* un déploiement de preview.
