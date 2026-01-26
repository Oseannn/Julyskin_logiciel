# Configuration Vercel - Jules Skin Frontend

## 🎯 Objectif
Connecter le frontend Vercel au backend Railway

## 📝 Étapes à suivre

### 1️⃣ Récupérer l'URL du Backend Railway

1. Va sur [Railway Dashboard](https://railway.app/dashboard)
2. Clique sur ton projet "Julyskin_logiciel"
3. Clique sur le service **backend** (pas Postgres)
4. Va dans l'onglet **Settings**
5. Scroll jusqu'à **Networking** ou **Domains**
6. Copie l'URL qui ressemble à: `https://xxxx.railway.app`

**Note:** Si tu ne vois pas d'URL, clique sur "Generate Domain" pour en créer une.

---

### 2️⃣ Configurer Vercel

1. Va sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique sur ton projet **frontend**
3. Va dans **Settings** (en haut)
4. Dans le menu de gauche, clique sur **Environment Variables**
5. Clique sur **Add New**

**Ajoute cette variable:**

```
Name: NEXT_PUBLIC_API_URL
Value: https://TON-URL-RAILWAY.railway.app/api
```

⚠️ **IMPORTANT:** 
- Remplace `TON-URL-RAILWAY.railway.app` par l'URL que tu as copiée à l'étape 1
- N'oublie pas `/api` à la fin!
- Exemple: `https://julesskin-backend-production.railway.app/api`

6. Sélectionne **Production**, **Preview**, et **Development**
7. Clique sur **Save**

---

### 3️⃣ Redéployer le Frontend

1. Reste sur Vercel
2. Va dans l'onglet **Deployments**
3. Trouve le dernier déploiement (en haut)
4. Clique sur les **3 points** (⋯) à droite
5. Clique sur **Redeploy**
6. Confirme en cliquant **Redeploy** à nouveau

---

### 4️⃣ Vérifier que ça fonctionne

Attends 1-2 minutes que le déploiement se termine, puis:

1. Va sur ton site Vercel
2. Ouvre la page de login
3. Essaie de te connecter avec:
   - **Email:** admin@julesskin.com
   - **Password:** Admin123!

---

## 🐛 Si ça ne marche toujours pas

### Vérifier les logs Vercel:
1. Va dans **Deployments** sur Vercel
2. Clique sur le dernier déploiement
3. Regarde les logs pour voir s'il y a des erreurs

### Vérifier que le backend fonctionne:
Ouvre cette URL dans ton navigateur:
```
https://TON-URL-RAILWAY.railway.app/api
```

Tu devrais voir une réponse (même si c'est une erreur 404, c'est normal).

### Vérifier la variable d'environnement:
1. Sur Vercel → Settings → Environment Variables
2. Vérifie que `NEXT_PUBLIC_API_URL` est bien définie
3. Vérifie qu'elle se termine par `/api`

---

## 📞 Besoin d'aide?

Si tu es bloqué, envoie-moi:
1. L'URL de ton backend Railway
2. L'URL de ton frontend Vercel
3. Une capture d'écran de l'erreur dans la console du navigateur (F12)
