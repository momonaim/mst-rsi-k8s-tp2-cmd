Étape 7 — Mise à jour de l'application (Rolling Update)

## Objectif

Simuler une mise à jour applicative en créant une nouvelle version d'image (v2), la pousser sur Docker Hub, puis mettre à jour le Deployment Kubernetes sans interruption de service (rolling update).

## Travail demandé

- Modifier la route `/` pour afficher un message différent (incluant `APP_ENV` ou `APP_NAME`).
- Construire une nouvelle image Docker tagguée `v2`.
- Pousser l'image sur Docker Hub.
- Mettre à jour le Deployment via `kubectl set image`.
- Observer le rolling update et vérifier la disponibilité du service.

## Étape 1 — Modifier la réponse de la route `/`

Modifiez votre fichier `app.js` (route `/`) :

**Avant (v1)** :

```js
if (req.method === "GET" && req.url === "/") {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`Hello World from ${os.hostname()}`);
  return;
}
```

**Après (v2)** - exemple avec APP_NAME et APP_ENV :

```js
if (req.method === "GET" && req.url === "/") {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <h1>🚀 Nouvelle version déployée !</h1>
    <p>App: ${process.env.APP_NAME}</p>
    <p>Env: ${process.env.APP_ENV}</p>
    <p>Host: ${os.hostname()}</p>
  `);
  return;
}
```

## Étape 2 — Construire la nouvelle image (tag v2)

Depuis le dossier contenant `Dockerfile` :

```powershell
docker build -t <your_dockerhub_username>/kubeapp:v2 .
```

Vérifier l'image :

```powershell
docker images | Select-String "kubeapp"
# ou
docker images | grep kubeapp
```

## Étape 3 — Pousser l'image sur Docker Hub

Se connecter à Docker Hub (si pas déjà fait) :

```powershell
docker login
```

Pousser l'image v2 :

```powershell
docker push <your_dockerhub_username>/kubeapp:v2
```

Vérifier sur Docker Hub que la nouvelle image est présente dans votre dépôt.

## Étape 4 — Mettre à jour le Deployment (kubectl set image)

Mettre à jour le Deployment pour utiliser l'image v2 :

```powershell
kubectl set image deployment/kubeapp kubeapp=<your_dockerhub_username>/kubeapp:v2
```

**Important** : `kubeapp=` correspond au nom du container dans le Deployment (par défaut identique au nom du Deployment).

## Étape 5 — Observer le rolling update

Suivre l'état du déploiement :

```powershell
kubectl rollout status deployment/kubeapp
```

Attendu :

```
deployment "kubeapp" successfully rolled out
```

Observer les Pods en temps réel (watch) :

```powershell
kubectl get pods -w
# Arrêter : CTRL+C
```

Vous verrez :

- Les nouveaux Pods v2 passer à `Running`.
- Les anciens Pods v1 passer à `Terminating` puis disparaître.
- **Comportement normal** : Kubernetes remplace progressivement les Pods sans interruption de service.

## Étape 6 — Vérifier la disponibilité du service

Tester la route toutes les 2 secondes (simulation d'une charge) :

```powershell
# Sur Windows PowerShell avec curl :
while ($true) { curl "$(minikube service kubeapp --url)" ; Start-Sleep -Seconds 2 }
```

Ou sur Linux/macOS :

```bash
watch -n2 curl $(minikube service kubeapp --url)
```

**Pendant le rolling update**, vous verrez une alternance entre les réponses v1 et v2, mais **jamais d'erreur** — c'est le comportement attendu du rolling update.

Exemple de réponse v2 :

```
🚀 Nouvelle version déployée !
App: KubeApp
Env: production
Host: kubeapp-7db8f9c6fd-xyz12
```

## Étape 7 — Vérifier la version finale

Vérifier que tous les Pods exécutent maintenant l'image v2 :

```powershell
kubectl describe deployment kubeapp | Select-String "Image"
# ou
kubectl describe deployment kubeapp | grep Image
```

Attendu :

```
Image: <your_dockerhub_username>/kubeapp:v2
```

Vérifier l'historique des déploiements :

```powershell
kubectl rollout history deployment/kubeapp
```

## Commandes utiles (diagnostic et rollback)

- Voir les événements du Deployment :

```powershell
kubectl describe deployment kubeapp
```

- Voir les logs du Pod actuel :

```powershell
kubectl logs deployment/kubeapp
```

- **Annuler la mise à jour** (revenir à la version précédente) :

```powershell
kubectl rollout undo deployment/kubeapp
```

- **Revenir à une révision spécifique** :

```powershell
kubectl rollout undo deployment/kubeapp --to-revision=1
```

- **Vérifier l'image d'un Pod** :

```powershell
kubectl get pods -o jsonpath='{.items[*].spec.containers[*].image}'
```

## Bonnes pratiques

- **Toujours versionner les images** : utilisez des tags explicites (`v1`, `v2`, `v2.1`, etc.) plutôt que `latest`.
- **Tester avant le déploiement** : déployer en environnement de test d'abord.
- **Planifier les mises à jour** : avertissez les utilisateurs ou prévoyez hors-heures.
- **Monitoring** : surveillez les métriques (CPU, mémoire, requêtes) pendant et après la mise à jour.
- **Stratégie de rolling update** : vous pouvez personnaliser le nombre de Pods remplacés simultanément (`maxSurge`, `maxUnavailable`) via un manifest YAML (non couvert ici).

Fin de l'étape 7
