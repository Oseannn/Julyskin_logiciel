# Documentation API - Jules Skin

## Base URL

```
Développement: http://localhost:4000/api
Production: https://your-backend.railway.app/api
```

## Authentification

Toutes les routes (sauf `/auth/login`) nécessitent un token JWT dans le header :

```
Authorization: Bearer <access_token>
```

## Codes de Réponse

- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Non trouvé
- `409` - Conflit
- `500` - Erreur serveur

## Endpoints

### Authentification

#### POST /auth/login

Connexion utilisateur.

**Body:**
```json
{
  "email": "admin@julesskin.com",
  "password": "Admin123!"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@julesskin.com",
    "firstName": "Admin",
    "lastName": "Jules Skin",
    "role": "ADMIN"
  }
}
```

#### POST /auth/refresh

Rafraîchir le token d'accès.

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

#### POST /auth/logout

Déconnexion.

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response 200:**
```json
{
  "message": "Déconnexion réussie"
}
```

---

### Utilisateurs (Admin uniquement)

#### GET /users

Liste tous les utilisateurs.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "email": "vendeuse@julesskin.com",
    "firstName": "Marie",
    "lastName": "Dupont",
    "role": "VENDEUSE",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /users

Créer un utilisateur.

**Body:**
```json
{
  "email": "nouvelle@julesskin.com",
  "password": "Password123!",
  "firstName": "Nouvelle",
  "lastName": "Vendeuse",
  "role": "VENDEUSE",
  "isActive": true
}
```

#### PATCH /users/:id

Modifier un utilisateur.

#### PATCH /users/:id/toggle-active

Activer/désactiver un utilisateur.

---

### Produits

#### GET /products

Liste tous les produits.

**Query params:**
- Aucun

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Crème Hydratante Visage",
    "description": "Crème hydratante pour tous types de peaux",
    "sellingPrice": 35.99,
    "purchasePrice": 18.50,  // Visible uniquement pour ADMIN
    "stock": 25,
    "alertThreshold": 5,
    "isActive": true,
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "Soins Visage"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /products (Admin)

Créer un produit.

**Body:**
```json
{
  "name": "Nouveau Produit",
  "description": "Description",
  "sellingPrice": 29.99,
  "purchasePrice": 15.00,
  "stock": 10,
  "alertThreshold": 3,
  "categoryId": "uuid",
  "isActive": true
}
```

#### GET /products/:id

Détails d'un produit avec historique des mouvements de stock.

#### PATCH /products/:id (Admin)

Modifier un produit.

#### POST /products/:id/adjust-stock (Admin)

Ajuster le stock manuellement.

**Body:**
```json
{
  "quantity": 10,  // Positif = ajout, négatif = retrait
  "reason": "Réapprovisionnement"
}
```

#### GET /products/low-stock (Admin)

Produits avec stock bas (sous le seuil d'alerte).

---

### Services

#### GET /services

Liste tous les services.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Soin Visage Complet",
    "description": "Nettoyage, gommage, masque et massage",
    "duration": 60,
    "price": 65.00,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /services (Admin)

Créer un service.

**Body:**
```json
{
  "name": "Nouveau Service",
  "description": "Description",
  "duration": 45,
  "price": 40.00,
  "isActive": true
}
```

#### GET /services/:id

Détails d'un service.

#### PATCH /services/:id (Admin)

Modifier un service.

---

### Clients

#### GET /clients

Liste tous les clients.

**Query params:**
- `search` (optionnel) - Recherche par nom, prénom, téléphone, email

**Response 200:**
```json
[
  {
    "id": "uuid",
    "firstName": "Sophie",
    "lastName": "Martin",
    "phone": "0612345678",
    "email": "sophie.martin@email.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /clients

Créer un client.

**Body:**
```json
{
  "firstName": "Nouveau",
  "lastName": "Client",
  "phone": "0612345678",
  "email": "client@email.com"  // Optionnel
}
```

#### GET /clients/:id

Détails d'un client avec historique des factures.

#### PATCH /clients/:id

Modifier un client.

---

### Factures

#### GET /invoices

Liste des factures.

**Query params:**
- `startDate` (optionnel) - Date début (ISO 8601)
- `endDate` (optionnel) - Date fin (ISO 8601)
- `status` (optionnel) - DRAFT, VALIDATED, CANCELLED

**Notes:**
- VENDEUSE : voit uniquement ses propres factures
- ADMIN : voit toutes les factures

**Response 200:**
```json
[
  {
    "id": "uuid",
    "invoiceNumber": "JS000001",
    "clientId": "uuid",
    "userId": "uuid",
    "subtotal": 100.00,
    "taxRate": 20.00,
    "taxAmount": 20.00,
    "total": 120.00,
    "status": "VALIDATED",
    "notes": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "validatedAt": "2024-01-01T00:00:00.000Z",
    "client": {
      "id": "uuid",
      "firstName": "Sophie",
      "lastName": "Martin"
    },
    "user": {
      "firstName": "Marie",
      "lastName": "Dupont"
    },
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "serviceId": null,
        "name": "Crème Hydratante Visage",
        "quantity": 2,
        "unitPrice": 35.99,
        "total": 71.98
      }
    ]
  }
]
```

#### POST /invoices

Créer une facture (statut DRAFT).

**Body:**
```json
{
  "clientId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    },
    {
      "serviceId": "uuid",
      "quantity": 1
    }
  ],
  "taxRate": 20,  // Optionnel, utilise la valeur par défaut
  "notes": "Notes optionnelles"
}
```

**Notes:**
- Chaque item doit avoir soit `productId` soit `serviceId`
- Les prix sont récupérés automatiquement
- Le stock n'est pas impacté tant que la facture n'est pas validée

#### GET /invoices/:id

Détails d'une facture.

#### POST /invoices/:id/validate

Valider une facture.

**Notes:**
- Vérifie le stock disponible
- Décrémente le stock
- Crée les mouvements de stock
- Rend la facture immuable
- VENDEUSE peut valider uniquement ses propres factures

---

### Catégories

#### GET /categories

Liste toutes les catégories.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Soins Visage",
    "description": "Produits pour le soin du visage",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /categories (Admin)

Créer une catégorie.

**Body:**
```json
{
  "name": "Nouvelle Catégorie",
  "description": "Description optionnelle"
}
```

#### GET /categories/:id

Détails d'une catégorie.

#### PATCH /categories/:id (Admin)

Modifier une catégorie.

---

### Statistiques (Admin uniquement)

#### GET /stats/dashboard

Statistiques globales.

**Query params:**
- `startDate` (optionnel) - Date début (ISO 8601)
- `endDate` (optionnel) - Date fin (ISO 8601)

**Response 200:**
```json
{
  "totalRevenue": 15420.50,
  "invoiceCount": 127,
  "topProducts": [
    {
      "id": "uuid",
      "name": "Crème Hydratante Visage",
      "quantity": 45,
      "revenue": 1619.55
    }
  ],
  "topServices": [
    {
      "id": "uuid",
      "name": "Soin Visage Complet",
      "quantity": 32,
      "revenue": 2080.00
    }
  ],
  "salesByUser": [
    {
      "userId": "uuid",
      "userName": "Marie Dupont",
      "invoiceCount": 67,
      "revenue": 8240.25
    }
  ]
}
```

---

### Paramètres (Admin uniquement)

#### GET /settings

Récupérer les paramètres.

**Response 200:**
```json
{
  "id": "uuid",
  "shopName": "Jules Skin",
  "shopAddress": "123 Rue de la Beauté, 75001 Paris",
  "shopPhone": "01 23 45 67 89",
  "shopEmail": "contact@julesskin.com",
  "defaultTaxRate": 20.00,
  "invoicePrefix": "JS",
  "nextInvoiceNumber": 42,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /settings

Modifier les paramètres.

**Body:**
```json
{
  "shopName": "Jules Skin Paris",
  "shopAddress": "Nouvelle adresse",
  "shopPhone": "01 23 45 67 89",
  "shopEmail": "contact@julesskin.com",
  "defaultTaxRate": 20.00,
  "invoicePrefix": "JS"
}
```

**Notes:**
- `nextInvoiceNumber` ne peut pas être modifié manuellement

---

## Gestion des Erreurs

### Format Standard

```json
{
  "statusCode": 400,
  "message": "Message d'erreur",
  "error": "Bad Request"
}
```

### Erreurs de Validation

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

## Rate Limiting

- 10 requêtes par minute par IP
- Header `X-RateLimit-Remaining` indique le nombre de requêtes restantes
- Status `429` si limite dépassée

## Pagination

Actuellement non implémentée. Recommandé pour les listes volumineuses :

```
GET /products?page=1&limit=20
```

## Webhooks (Future)

Pour les intégrations futures, webhooks disponibles pour :
- Nouvelle facture validée
- Stock bas
- Nouvelle commande
