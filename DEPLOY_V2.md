# Déploiement V2 - Guide complet

## ⚠️ IMPORTANT: Backup de la base de données

Avant de déployer, sauvegarde ta base actuelle si elle contient des données importantes.

## 🚀 Étapes de déploiement

### 1. Backend Railway

Le backend va automatiquement se redéployer avec le nouveau code.

**Ce qui va se passer:**
- Railway détecte le push sur GitHub
- Build du nouveau code
- Exécution de `prisma db push --accept-data-loss` (dans le Dockerfile)
- Exécution du seed avec les nouveaux services

**⚠️ Attention:** `prisma db push --accept-data-loss` va **supprimer toutes les données** et recréer les tables.

### 2. Vérifier le déploiement Railway

1. Va sur Railway Dashboard
2. Clique sur ton service backend
3. Vérifie les logs de déploiement
4. Cherche: "✅ Database seeded successfully with v2 schema!"

### 3. Frontend Vercel

Vercel va automatiquement redéployer le frontend.

**Vérification:**
1. Va sur Vercel Dashboard
2. Attends que le déploiement se termine
3. Teste l'application

## 🧪 Tests à effectuer

### Test 1: Services
1. Va sur `/dashboard/services`
2. Vérifie que tu vois les badges de type (Par minute, Par heure, Forfait)
3. Vérifie les prix affichés avec unités (€/min, €/h)

### Test 2: Création de facture
1. Va sur `/dashboard/invoices/new`
2. Sélectionne un client
3. Ajoute un service "Massage Relaxant" (PAR_HEURE)
4. Saisis 90 minutes
5. Vérifie que le total se calcule: 60€/h * 1.5h = 90€
6. Ajoute un service "Épilation Sourcils" (PAR_MINUTE)
7. Saisis 15 minutes
8. Vérifie que le total se calcule: 0.80€/min * 15 = 12€
9. Ajoute un service "Soin Visage" (FORFAIT)
10. Vérifie que le prix est fixe: 65€
11. Crée la facture

### Test 3: Affichage facture
1. Va sur `/dashboard/invoices`
2. Vérifie que les durées s'affichent pour les services
3. Clique sur une facture
4. Vérifie le détail avec durées

## 📊 Données de test

Après le seed, tu auras:

**Utilisateurs:**
- Admin: admin@julesskin.com / Admin123!
- Vendeuse: vendeuse@julesskin.com / Vendeuse123!

**Services:**
- Massage Relaxant: 60€/h (min 30 min)
- Épilation Sourcils: 0.80€/min (min 10 min)
- Soin Visage Complet: 65€ forfait
- Manucure: 35€ forfait
- Pédicure: 45€/h (min 45 min)

**Produits:**
- 5 produits cosmétiques avec stock

**Clients:**
- 3 clients de test

## 🐛 En cas de problème

### Erreur: "InvoiceItem does not exist"
**Solution:** La base n'a pas été migrée. Railway doit exécuter `prisma db push`.

### Erreur: "billingType is required"
**Solution:** Le frontend n'est pas à jour. Attends que Vercel finisse le déploiement.

### Erreur 404 sur les pages
**Solution:** Vercel n'a pas déployé. Va sur Vercel → Settings → Git et vérifie la connexion.

## ✅ Checklist finale

- [ ] Backend Railway déployé avec succès
- [ ] Logs Railway montrent "Database seeded successfully"
- [ ] Frontend Vercel déployé
- [ ] Connexion fonctionne
- [ ] Page services affiche les types de facturation
- [ ] Création de facture avec durée fonctionne
- [ ] Calcul automatique correct
- [ ] Affichage des factures avec durées

## 🎉 Après le déploiement

Ton application est maintenant V2 avec:
- ✅ Facturation par minute
- ✅ Facturation par heure
- ✅ Facturation au forfait
- ✅ Calcul automatique selon le type
- ✅ Validation des durées minimales
- ✅ Interface adaptée pour saisir les durées

**Prochaines améliorations possibles:**
- Export PDF des factures
- Statistiques par type de service
- Gestion des promotions
- Multi-devises
