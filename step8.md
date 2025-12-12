Étape 8 — Vérifications via le navigateur et le tableau de bord

## Objectif

Valider le bon fonctionnement de l'application v2, observer la répartition du trafic entre les réplicas, et utiliser le tableau de bord Kubernetes de Minikube pour inspecter toutes les ressources.

## Travail demandé

- Tester la route `/` dans le navigateur et vérifier que la version 2 est bien déployée.
- Recharger plusieurs fois la page pour observer les différents hostnames des Pods (round-robin).
- Lancer le tableau de bord Kubernetes.
- Vérifier l'état du Deployment, des Pods, du Service, de MySQL, du Secret et du ConfigMap.

## Étape 1 — Tester la route `/` dans le navigateur

Lancer l'accès au Service via Minikube :

```powershell
minikube service kubeapp
```

Cela ouvre automatiquement le navigateur avec l'URL de votre Service NodePort.

**Résultat attendu** :

```
🚀 Nouvelle version déployée !
App: KubeApp
Env: production
Host: kubeapp-7db8f9c6fd-abcde
```

Cela confirme que la version v2 est bien déployée.

## Étape 2 — Recharger la page plusieurs fois (round-robin)

Appuyez sur **F5** ou **Ctrl+R** plusieurs fois pour recharger la page.

À chaque rechargement, observez le **hostname** qui change, par exemple :

```
kubeapp-7db8f9c6fd-vk29p
kubeapp-7db8f9c6fd-ldm2x
kubeapp-7db8f9c6fd-ghz7t
```

Cela confirme que **Kubernetes distribue les requêtes** entre les 3 Pods du Deployment grâce au **round-robin** du Service.

## Étape 3 — Accéder au Tableau de bord Kubernetes

Lancez le Kubernetes Dashboard :

```powershell
minikube dashboard
```

Minikube ouvre automatiquement le dashboard dans le navigateur.

## Étape 4 — Vérifier les ressources dans le tableau de bord

**4.1. Deployment kubeapp**

- Image : votre-username/kubeapp:v2
- Replicas : 3/3
- Status : Deployment has minimum availability

**4.2. Pods (3 replicas)**

Tous en état "Running"

**4.3. Service kubeapp**

- Type : NodePort
- Ports : 3000 → 3xxxx

**4.4. MySQL Pod**

- Status : Running
- Port : 3306

**4.5. Secret (db-secret)**

- Clés : DB_USER, DB_PASSWORD
- Affichées en base64 (caché par défaut)

**4.6. ConfigMap (app-config)**

- APP_NAME : KubeApp
- APP_ENV : production

## Fin

Vous avez maintenant validé :

- ✅ Un Deployment Kubernetes avec 3 replicas
- ✅ Un Service NodePort pour accéder à l'application
- ✅ Une mise à jour fluide (rolling update) de v1 à v2
- ✅ Une base de données MySQL intégrée
- ✅ Des variables d'environnement gérées par ConfigMap et Secret

## Bonnes pratiques

1. **Utilisez les rolling updates** pour éviter les downtime
2. **Surveillez via le Dashboard** pour suivre la santé des ressources
3. **Vérifiez l'accessibilité** avec `minikube service` avant la production
4. **Consultez les logs** avec `kubectl logs <pod-name>` en cas de problème

## Résumé

| Étape | Action              | Résultat                                |
| ----- | ------------------- | --------------------------------------- |
| 1     | Accéder au Service  | Page affiche v2                         |
| 2     | Recharger la page   | Hostnames changent (round-robin)        |
| 3     | Ouvrir Dashboard    | Interface Kubernetes visible            |
| 4     | Vérifier ressources | Deployment, Pods, Service, MySQL actifs |

---

Étape 8 complétée ✅
