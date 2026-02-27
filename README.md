# TRÄNCËNÐ Store

Site e-commerce inspiré de [trancendstore.com](https://trancendstore.com/), construit avec **SolidStart** (SSR) et **PocketBase** comme backend.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | SolidStart 1.0.6 (SSR) |
| Backend / DB | PocketBase 0.22+ |
| Bundler | Vinxi 0.4.3 |
| Langage | TypeScript |
| Style | CSS custom (variables, animations) |

---

## Installation rapide

### 1. Extraire et installer

```bash
cd trancend-store
rm -rf node_modules package-lock.json   # si déjà installé
npm install
```

### 2. Lancer PocketBase

Télécharger depuis [pocketbase.io](https://pocketbase.io/docs/) puis :

```bash
# Placer le binaire dans le dossier du projet ou ailleurs
./pocketbase serve
# Admin UI → http://127.0.0.1:8090/_/
# Créer votre compte admin au premier lancement
```

### 3. Fichier `.env`

Créer `.env` à la racine :

```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

En production remplacer par l'URL publique de votre PocketBase.

### 4. Initialiser la base de données

```bash
# Avec les identifiants admin que vous avez créés à l'étape 2
PB_ADMIN_EMAIL=votre@email.com PB_ADMIN_PASSWORD=votremdp node scripts/setup-pocketbase.js
```

Ce script crée automatiquement les 4 collections et insère les données de démo.

### 5. Lancer le serveur de dev

```bash
npm run dev
# → http://localhost:3000
```

---

## Collections PocketBase

### `categories`
Gère les catégories affichées sur la home et dans les filtres du shop.

| Champ | Type | Description |
|-------|------|-------------|
| `name` | Text | Nom affiché (ex: TOPS) |
| `slug` | Text | Identifiant URL (ex: tops) |
| `description` | Text | Sous-titre de la carte |
| `image` | File | Photo de couverture de la catégorie |
| `order` | Number | Ordre d'affichage |
| `active` | Bool | Masquer/afficher sans supprimer |

### `products`
Catalogue produits.

| Champ | Type | Description |
|-------|------|-------------|
| `name` | Text | Nom du produit |
| `price` | Number | Prix en euros |
| `description` | Text | Description |
| `category` | Text | Slug de la catégorie (ex: tops) |
| `images` | File (multiple) | Photos du produit |
| `sizes` | JSON | Tableau de tailles `["S","M","L"]` |
| `in_stock` | Bool | Disponibilité |
| `featured` | Bool | Affiché dans le carousel home |

### `carts`
Panier persisté par utilisateur connecté.

| Champ | Type | Description |
|-------|------|-------------|
| `user` | Relation → users | Propriétaire |
| `items` | JSON | Array des articles `[{product, size, quantity}]` |

### `orders`
Commandes passées.

| Champ | Type | Description |
|-------|------|-------------|
| `user` | Relation → users | Client |
| `items` | JSON | Articles commandés |
| `total` | Number | Montant total |
| `status` | Select | `pending / confirmed / shipped / delivered / cancelled` |
| `shipping_address` | Text | Adresse de livraison |

---

## Structure du projet

```
src/
├── app.tsx                    # Root: Router + Navbar + CartDrawer + Footer
├── entry-client.tsx
├── entry-server.tsx
│
├── lib/
│   ├── pocketbase.ts          # Client PB, auth, types, toutes les fonctions API
│   └── cart.ts                # Store panier (signals + localStorage + sync PB)
│
├── components/
│   ├── Navbar.tsx             # Nav SSR-safe avec état auth
│   ├── CartDrawer.tsx         # Drawer latéral SSR-safe
│   ├── ProductCard.tsx        # Carte produit avec quick-add
│   ├── Footer.tsx             # Footer avec newsletter + liens
│   └── PolicyLayout.tsx       # Layout réutilisable pour les pages légales
│
├── routes/
│   ├── index.tsx              # Home: hero + carousel + catégories + philosophie
│   ├── shop.tsx               # Boutique avec filtres catégories (PocketBase)
│   ├── search.tsx             # Recherche
│   ├── about.tsx
│   ├── contact.tsx
│   ├── checkout.tsx           # Commande (auth requis)
│   │
│   ├── auth/
│   │   ├── login.tsx          # Connexion
│   │   └── register.tsx       # Inscription
│   │
│   ├── account/
│   │   └── index.tsx          # Dashboard: infos + historique commandes
│   │
│   ├── products/
│   │   └── [id].tsx           # Page produit: galerie, tailles, add to cart
│   │
│   └── policies/
│       ├── legal.tsx
│       ├── refund.tsx
│       ├── sales.tsx
│       ├── shipping.tsx
│       ├── terms.tsx
│       ├── privacy.tsx
│       └── contact-info.tsx
│
└── styles/
    └── global.css             # Design system complet (variables, composants, animations)
```

---

## Fonctionnement de l'authentification

- L'état auth (`currentUser`) démarre toujours à `null` côté serveur (SSR)
- Au chargement côté client, PocketBase tente un `auth-refresh` silencieux
- Une fois résolu (`authReady = true`), la navbar et le drawer affichent l'état réel
- Cette approche évite tout **hydration mismatch** entre SSR et client

### Flux panier

```
Non connecté  →  localStorage uniquement
Connexion     →  fusion panier local + panier PocketBase
Connecté      →  sync automatique vers collection "carts" à chaque modification
Commande      →  crée un enregistrement dans "orders", vide le panier
```

---

## Routes disponibles

| Route | Description |
|-------|-------------|
| `/` | Home avec carousel featured + catégories |
| `/shop` | Boutique complète |
| `/shop?cat=tops` | Filtré par catégorie |
| `/products/:id` | Page produit |
| `/search` | Recherche |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription |
| `/account` | Mon compte + commandes |
| `/checkout` | Passer commande (auth requis) |
| `/about` | À propos |
| `/contact` | Contact |
| `/policies/legal` | Mention légale |
| `/policies/refund` | Politique de remboursement |
| `/policies/sales` | Conditions de vente |
| `/policies/shipping` | Shipping policy |
| `/policies/terms` | Terms of service |
| `/policies/privacy` | Privacy policy |
| `/policies/contact-info` | Contact information |

---

## Production

```bash
npm run build
npm run start
```

Pensez à mettre `VITE_POCKETBASE_URL` et `POCKETBASE_URL` (côté serveur) vers votre instance PocketBase publique.

---

## Notes

- **Données mockées** : si PocketBase n'est pas accessible, le site fonctionne avec des données de démo intégrées
- **Images** : servies directement par PocketBase via son API de fichiers
- **Erreur 503** sur `auth-refresh` : normale si PocketBase n't est pas lancé, gérée silencieusement
