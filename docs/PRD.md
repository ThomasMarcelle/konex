# Project Requirements Document (PRD) - Konex

## 1. Vue d'ensemble
Konex est une marketplace B2B connectant des entreprises SaaS avec des micro-influenceurs LinkedIn (1K-50K followers). La plateforme facilite la mise en relation, la gestion des campagnes et les paiements sécurisés.

## 2. Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Language**: TypeScript
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Paiements**: Stripe Connect

## 3. Fonctionnalités Principales

### 3.1 Pour les SaaS (Clients)
- Inscription/Connexion (Email pro, LinkedIn).
- Création de profil entreprise (Logo, Description, Site web).
- Recherche d'influenceurs (Filtres : Secteur, Taille audience, Engagement).
- Création d'offres de campagne.
- Gestion des campagnes actives.
- Paiement via Stripe.

### 3.2 Pour les Influenceurs
- Inscription/Connexion (LinkedIn obligatoire).
- Création de profil (Bio, Stats LinkedIn, Tarifs).
- Réception et gestion des offres.
- Soumission des preuves de publication.
- Réception des paiements (Stripe Connect).

### 3.3 Admin
- Dashboard global.
- Modération des profils et campagnes.
- Gestion des litiges.

## 4. Structure de la Base de Données (Ébauche)

### Users (Supabase Auth)
- `id`: UUID
- `email`: String
- `role`: 'saas' | 'influencer' | 'admin'

### Profiles
- `id`: UUID (FK Users)
- `full_name`: String
- `avatar_url`: String
- `linkedin_url`: String
- `bio`: Text
- `created_at`: Timestamp

### SaaS_Companies
- `id`: UUID
- `profile_id`: UUID (FK Profiles)
- `company_name`: String
- `website`: String
- `industry`: String

### Campaigns
- `id`: UUID
- `saas_id`: UUID (FK SaaS_Companies)
- `title`: String
- `description`: Text
- `budget`: Integer
- `status`: 'draft' | 'active' | 'completed'

## 5. Roadmap
1. **Phase 1**: Setup projet, Auth, Profils basiques.
2. **Phase 2**: Listing influenceurs, Création campagnes.
3. **Phase 3**: Chat/Offres, Stripe Connect.
4. **Phase 4**: Lancement Beta.

## 6. Conventions
- **Commits**: Conventional Commits (feat, fix, docs, style, refactor).
- **Styles**: Tailwind CSS avec tokens custom (voir `globals.css`).

