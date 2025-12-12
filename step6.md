Étape 6 — Connexion à une base MySQL avec ConfigMap et Secret

## Objectif

Déployer une base de données MySQL dans le cluster Kubernetes, gérer les configurations sensibles via Secret et non-sensibles via ConfigMap, puis adapter l'application Node.js pour utiliser ces ressources.

## Travail demandé

- Déployer MySQL dans le cluster (Deployment + Service).
- Créer un `Secret` contenant les credentials MySQL : `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Créer un `ConfigMap` contenant les paramètres applicatifs : `APP_NAME`, `APP_ENV`.
- Adapter le Deployment Node.js pour injecter ces variables d'environnement.
- Adapter l'application Node.js pour lire et utiliser ces variables.
- Vérifier la connexion à MySQL.

## Partie 1 — Déployer MySQL

### 1.1) Créer un Secret pour MySQL

```powershell
kubectl create secret generic mysql-secret `
  --from-literal=MYSQL_ROOT_PASSWORD=root
```

### 1.2) Créer le Deployment MySQL

```powershell
kubectl create deployment mysql --image=mysql:9.2
```

### 1.3) Configurer l'environnement MySQL

```powershell
kubectl set env deployment/mysql `
  MYSQL_ROOT_PASSWORD=root `
  MYSQL_DATABASE=kubeappdb `
  MYSQL_USER=kubeuser `
  MYSQL_PASSWORD=userpass123
```

### 1.4) Exposer MySQL via un Service

```powershell
kubectl expose deployment mysql `
  --port=3306 `
  --target-port=3306 `
  --name=mysql
```

### 1.5) Vérifier le déploiement

```powershell
kubectl get pods
kubectl get svc
kubectl describe service mysql
```

## Partie 2 — Créer le Secret pour l'application

Créez un Secret contenant les credentials de base de données :

```powershell
kubectl create secret generic db-secret `
  --from-literal=DB_NAME=kubeappdb `
  --from-literal=DB_USER=kubeuser `
  --from-literal=DB_PASSWORD=userpass123
```

Vérifier :

```powershell
kubectl describe secret db-secret
kubectl get secret db-secret -o yaml
```

## Partie 3 — Créer le ConfigMap

Créez un ConfigMap pour les paramètres non-sensibles :

```powershell
kubectl create configmap app-config `
  --from-literal=APP_NAME=KubeApp `
  --from-literal=APP_ENV=production
```

Vérifier :

```powershell
kubectl describe configmap app-config
kubectl get configmap app-config -o yaml
```

## Partie 4 — Adapter le Deployment Node.js

### 4.1) Injecter les variables du Secret

```powershell
kubectl set env deployment/kubeapp `
  --from=secret/db-secret
```

Cela ajoute `DB_NAME`, `DB_USER`, `DB_PASSWORD` au Deployment.

### 4.2) Injecter les variables du ConfigMap

```powershell
kubectl set env deployment/kubeapp `
  --from=configmap/app-config
```

Cela ajoute `APP_NAME`, `APP_ENV` au Deployment.

### 4.3) Ajouter les variables de connexion MySQL

```powershell
kubectl set env deployment/kubeapp `
  DB_HOST=mysql `
  DB_PORT=3306
```

Le service MySQL s'appelle `mysql`, donc l'adresse est : `mysql.default.svc.cluster.local` (ou simplement `mysql` au sein du cluster).

### 4.4) Vérifier les variables du Deployment

```powershell
kubectl describe deployment kubeapp
# ou
kubectl get deployment kubeapp -o yaml
```

## Partie 5 — Adapter le code Node.js

Installez le driver MySQL :

```powershell
npm install mysql2
```

Voici un exemple d'adaptation du fichier `app.js` pour utiliser les variables d'environnement et MySQL :

```js
const http = require("http");
const os = require("os");
const mysql = require("mysql2");

// Lire les variables d'environnement
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, APP_NAME, APP_ENV } =
  process.env;

const port = process.env.PORT || 3000;

// Créer la connexion MySQL
const connection = mysql.createConnection({
  host: DB_HOST || "localhost",
  port: DB_PORT || 3306,
  user: DB_USER || "root",
  password: DB_PASSWORD || "",
  database: DB_NAME || "test",
});

// Tenter la connexion
connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Connected to MySQL database:", DB_NAME);
  }
});

// Créer le serveur HTTP
const server = http.createServer((req, res) => {
  // Route /
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <h1>App: ${APP_NAME}</h1>
      <p>Environment: ${APP_ENV}</p>
      <p>Hostname: ${os.hostname()}</p>
      <p>Database: ${DB_NAME}</p>
    `);
    return;
  }

  // Route /health (vérifier la connexion MySQL)
  if (req.method === "GET" && req.url === "/health") {
    connection.query("SELECT 1", (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: err.message }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", database: DB_NAME }));
      }
    });
    return;
  }

  // Route /exit
  if (req.method === "GET" && req.url === "/exit") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Shutting down");
    server.close(() => process.exit(0));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`APP_NAME: ${APP_NAME}`);
  console.log(`APP_ENV: ${APP_ENV}`);
  console.log(`DB_HOST: ${DB_HOST}`);
  console.log(`DB_NAME: ${DB_NAME}`);
});
```

## Partie 6 — Tester la connexion MySQL

### 6.1) Vérifier les logs de l'application Node.js

```powershell
kubectl logs deployment/kubeapp
```

Vous devriez voir :

```
✅ Connected to MySQL database: kubeappdb
App listening on port 3000
APP_NAME: KubeApp
APP_ENV: production
DB_HOST: mysql
DB_NAME: kubeappdb
```

### 6.2) Vérifier les logs de MySQL

```powershell
kubectl logs deployment/mysql
```

### 6.3) Tester la route `/health`

```powershell
# Port-forward vers le service kubeapp (si pas encore exposé)
kubectl port-forward service/kubeapp 3000:3000

# Dans un autre terminal
curl http://localhost:3000/health
# Résultat attendu: {"status":"ok","database":"kubeappdb"}
```

### 6.4) Accéder à l'application via le navigateur

Si vous avez exposé le service en `NodePort` :

```powershell
minikube service kubeapp
```

Le navigateur doit afficher :

```
App: KubeApp
Environment: production
Hostname: kubeapp-xxxxx
Database: kubeappdb
```

## Dépannage

- **Les Pods restent en `Pending` ou `CrashLoopBackOff`** :
  - Vérifiez `kubectl describe pod <pod-name>` et `kubectl logs <pod-name>`.
- **Erreur de connexion MySQL** :

  - Vérifiez que le service `mysql` existe : `kubectl get svc mysql`.
  - Vérifiez les logs MySQL : `kubectl logs deployment/mysql`.
  - Vérifiez que les variables d'environnement sont injectées : `kubectl describe pod <pod-name>`.

- **Afficher les variables d'environnement d'un Pod** :

```powershell
kubectl describe pod <pod-name>
# ou
kubectl exec <pod-name> -- env | grep DB_
```

## Commandes utiles

```powershell
# Lister les ressources Kubernetes
kubectl get secret
kubectl get configmap
kubectl get deployment
kubectl get svc

# Décrire les ressources
kubectl describe secret db-secret
kubectl describe configmap app-config
kubectl describe deployment kubeapp

# Nettoyer (optionnel)
kubectl delete secret db-secret
kubectl delete configmap app-config
kubectl delete deployment kubeapp
kubectl delete deployment mysql
kubectl delete svc mysql kubeapp
```

Fin de l'étape 6
