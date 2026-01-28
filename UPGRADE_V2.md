# Upgrade vers V2 - Facturation par durée

## ✅ Modifications effectuées

### 1. Schema Prisma
- ✅ Ajout enum `ServiceBillingType` (PAR_MINUTE, PAR_HEURE, FORFAIT)
- ✅ Ajout enum `InvoiceLineType` (PRODUCT, SERVICE)
- ✅ Modification model `Service`:
  - `billingType`: type de facturation
  - `unitPrice`: prix unitaire (par minute, par heure, ou forfait)
  - `minDuration`: durée minimale optionnelle
- ✅ Renommage `InvoiceItem` → `InvoiceLine`
- ✅ Modification `InvoiceLine`:
  - `type`: PRODUCT ou SERVICE
  - `quantity`: pour les produits
  - `duration`: pour les services (en minutes)

### 2. DTOs
- ✅ `CreateServiceDto`: ajout billingType, unitPrice, minDuration
- ✅ `CreateInvoiceDto`: ajout duration optionnel dans items

### 3. Seed
- ✅ Nouveaux services avec différents types de facturation
- ✅ Exemples: Massage (PAR_HEURE), Épilation (PAR_MINUTE), Soin (FORFAIT)

## 🔄 Modifications à faire

### Backend

1. **services.service.ts**
   - Adapter aux nouveaux champs (billingType, unitPrice, minDuration)

2. **invoices.service.ts** (CRITIQUE)
   - Calculer le prix selon le type de service:
     - PAR_MINUTE: unitPrice * duration
     - PAR_HEURE: unitPrice * (duration / 60)
     - FORFAIT: unitPrice (ignorer duration)
   - Valider que duration est fourni pour PAR_MINUTE et PAR_HEURE
   - Créer InvoiceLine avec type PRODUCT ou SERVICE

3. **Migration**
   - Créer et appliquer la migration
   - Seed la base avec les nouvelles données

### Frontend

1. **Services page**
   - Afficher le type de facturation
   - Afficher le prix selon le type (€/min, €/h, forfait)

2. **Nouvelle facture**
   - Pour les services PAR_MINUTE/PAR_HEURE: saisir la durée
   - Pour FORFAIT: pas de durée
   - Calculer le total en temps réel

3. **Affichage factures**
   - Afficher la durée pour les services
   - Format: "Massage - 90 min - 90.00€"

## 📋 Commandes pour déployer

```bash
# Backend
cd backend
npx prisma generate
npx prisma db push --accept-data-loss  # Reset DB
npm run prisma:seed

# Commit
git add .
git commit -m "feat: add service billing by minute/hour/forfait"
git push origin main
```

## 🎯 Prochaines étapes

1. Mettre à jour invoices.service.ts avec la logique de calcul
2. Mettre à jour le frontend pour saisir la durée
3. Tester la création de factures avec services
4. Déployer sur Railway/Vercel
