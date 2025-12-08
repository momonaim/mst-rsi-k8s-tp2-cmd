Étape 2 — Construction et publication de l’image Docker

## Objectif

L’objectif de cette étape est de rendre votre application exécutable dans un conteneur Docker.
Travail demandé

---

- Rédiger un `Dockerfile` qui :
  - utilise une image de base Node.js officielle ;
  - copie le code source dans l'image ;
  - installe les dépendances de manière reproductible ;
  - expose le port d'écoute de l'application ;
  - définit la commande de démarrage.
- Construire l'image localement et la tagger `
<your_dockerhub_username>/kubeapp:v1`.
- Se connecter à Docker Hub (`docker login`) et pousser l'image (`docker push`).

## Dockerfile (recommandé)

```Dockerfile
FROM node:18

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json si présent
COPY package*.json ./

# Installer les dépendances de façon reproductible
# Utiliser npm ci garantit les versions du package-lock.json
RUN npm ci --only=production

# Copier le reste du code
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
```

Note : `npm ci` échoue si `package-lock.json` est absent. Si nécessaire, générez-le d'abord :

```powershell
npm install
```

## Construction et publication

1. Construire l'image (depuis le dossier `kubeapp/`) :

```powershell
docker build -t <your_dockerhub_username>/kubeapp:v1 .
```

2. Se connecter à Docker Hub :

```powershell
docker login
# renseigner votre username et token/mot de passe
```

3. Pousser l'image :

```powershell
docker push <your_dockerhub_username>/kubeapp:v1
```

## Vérifications rapides

- Lister les images locales :

```powershell
docker images | Select-String "kubeapp"
```

- Vérifier sur Docker Hub que le dépôt `<your_dockerhub_username>/kubeapp` contient le tag `v1`.

## Bonnes pratiques

- Ajoutez un fichier `.dockerignore` pour exclure `node_modules`, `.env`, etc.
- En production, évitez d'inclure des secrets dans l'image ; utilisez des variables d'environnement ou des secrets.
- Pour réduire la taille des images, considérez `node:18-alpine` ou une stratégie multi-stage.

## Commandes combinées (PowerShell)

```powershell
# générer lock si besoin, builder, login, push
npm install; docker build -t <your_dockerhub_username>/kubeapp:v1 .; docker login; docker push <your_dockerhub_username>/kubeapp:v1
```

Fin de l'étape 2
