Étape 4 — Création impérative d’un Deployment

## Objectif

Déployer l'application dans Kubernetes en utilisant uniquement des commandes `kubectl` (sans manifest YAML) : créer le Deployment, le mettre à l'échelle à 3 réplicas et vérifier l'état des Pods.

## Image utilisée

Remplacez par votre image si besoin :

```
ita03mouadili/kubeapp:v1
```

## Étapes (impératif)

1. Créer le Deployment (1 réplica par défaut) :

```powershell
kubectl create deployment kubeapp --image=ita03mouadili/kubeapp:v1
```

2. Mettre à l'échelle pour obtenir 3 réplicas :

```powershell
kubectl scale deployment kubeapp --replicas=3
```

3. Vérifier la création des Pods et leur statut :

```powershell
kubectl get pods
```

Exemple de résultat attendu :

```
kubeapp-xxxxx   Running
kubeapp-xxxxx   Running
kubeapp-xxxxx   Running
```

4. Observer les Pods en temps réel (watch) :

```powershell
kubectl get pods -w
# Arrêter : CTRL+C
```

5. Vérifier le `Deployment` :

```powershell
kubectl get deployment kubeapp
```

6. Obtenir les détails du `Deployment` :

```powershell
kubectl describe deployment kubeapp
```

Vous devriez voir :

- `Replicas desired`: 3
- `Replicas available`: 3
- `Image`: ita03mouadili/kubeapp:v1

## Attendre la fin du rollout

Pour attendre proprement que le déploiement termine :

```powershell
kubectl rollout status deployment/kubeapp
```

## Commandes de diagnostic utiles

- Voir les logs d'un Pod :

```powershell
kubectl logs <pod-name>
```

- Obtenir des informations étendues :

```powershell
kubectl get pods -o wide
```

- Décrire un Pod pour diagnostiquer events/conditions :

```powershell
kubectl describe pod <pod-name>
```

- Supprimer le Deployment :

```powershell
kubectl delete deployment kubeapp
```

## Remarques

- L'approche impérative est pratique pour des tests ou des démonstrations rapides. Pour la production, utilisez des manifests YAML versionnés.
- Si les Pods restent en `Pending` ou `CrashLoopBackOff`, consultez `kubectl describe pod <pod>` et `kubectl logs <pod>` pour identifier la cause (image non trouvée, port manquant, crash d'application, quotas, etc.).

Fin de l'étape 4
