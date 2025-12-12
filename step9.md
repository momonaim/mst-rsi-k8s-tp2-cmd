# Étape 9 — Vérification du comportement de redémarrage (self-healing) et absence de downtime

Dans cette dernière étape, vous allez analyser le comportement de Kubernetes lors de l’appel à la route `/exit`.

## Objectifs

- Vérifier que Kubernetes redémarre automatiquement un Pod dont le processus s’est terminé avec une erreur.
- Observer l’augmentation de la colonne **RESTARTS** pour le Pod concerné.
- Confirmer que l’application reste accessible sans interruption apparente (zéro downtime) grâce aux autres Pods.

## Travail demandé

1. Accéder à la route `/exit` via un navigateur ou un outil en ligne de commande (par exemple `curl`) en passant par le Service exposé.
2. Surveiller l’état des Pods en temps réel et repérer celui qui se termine puis est recréé.
3. Noter la valeur de la colonne **RESTARTS** avant et après l’appel à la route `/exit`.
4. Pendant que le Pod se termine et redémarre, tester la route `/` à plusieurs reprises pour vérifier que les autres Pods continuent de répondre normalement.
5. Conclure sur la capacité de Kubernetes à maintenir la disponibilité de l’application (self-healing, zéro downtime) malgré la terminaison volontaire d’un des conteneurs.

---

Cette étape valide que Kubernetes :

- détecte les Pods morts ou en erreur,
- les redémarre automatiquement,
- maintient la disponibilité du service grâce aux autres Pods.

---

## Étape 1 — Appeler la route `/exit` pour arrêter un Pod

Accédez à la route `/exit` via le navigateur ou en ligne de commande :

```powershell
# Via le navigateur :
minikube service kubeapp
# Puis ajoutez /exit à l'URL

# Ou via curl :
curl "$(minikube service kubeapp --url)/exit"
```

Cet appel déclenche `process.exit(1)` dans votre application, arrêtant le conteneur immédiatement.

---

## Étape 2 — Surveiller les Pods en temps réel

Dans un terminal, activez le monitoring en temps réel :

```powershell
kubectl get pods -w
```

Vous observerez une séquence similaire à :

```
NAME                      READY   STATUS        RESTARTS   AGE
kubeapp-7db8f9c6fd-vk29p   1/1    Running       0          5m
kubeapp-7db8f9c6fd-ldm2x   1/1    Running       0          5m
kubeapp-7db8f9c6fd-ghz7t   1/1    Running       0          5m

# Après l'appel à /exit :

kubeapp-7db8f9c6fd-vk29p   1/1    Terminating   0          5m
kubeapp-7db8f9c6fd-vk29p   0/1    Terminating   0          5m
kubeapp-7db8f9c6fd-vk29p   0/1    Terminated    0          5m

# Kubernetes recrée automatiquement un nouveau Pod :

kubeapp-7db8f9c6fd-abcd1   0/1    ContainerCreating   0    1s
kubeapp-7db8f9c6fd-abcd1   1/1    Running             0    3s
```

C'est le **self-healing automatique** : Kubernetes détecte que le nombre de replicas actifs est inférieur au nombre demandé et crée un nouveau Pod pour le restaurer.

---

## Étape 3 — Observer l'augmentation du compteur RESTARTS

**Avant l'appel à `/exit`** :

```powershell
kubectl get pods
```

Résultat attendu :

```
NAME                      READY   STATUS    RESTARTS   AGE
kubeapp-7db8f9c6fd-vk29p   1/1    Running   0          10m
kubeapp-7db8f9c6fd-ldm2x   1/1    Running   0          10m
kubeapp-7db8f9c6fd-ghz7t   1/1    Running   0          10m
```

**Après l'appel à `/exit`** :

```powershell
kubectl get pods
```

Résultat attendu :

```
NAME                      READY   STATUS    RESTARTS   AGE
kubeapp-7db8f9c6fd-ldm2x   1/1    Running   0          10m
kubeapp-7db8f9c6fd-ghz7t   1/1    Running   0          10m
kubeapp-7db8f9c6fd-abcd1   1/1    Running   0          30s
```

**Remarque** : Le Pod qui s'est arrêté a été supprimé et remplacé par un nouveau. Si le même Pod redémarre (cas d'une erreur passagère), vous verriez l'augmentation du compteur **RESTARTS**.

---

## Étape 4 — Vérifier le zéro downtime pendant le redémarrage

Pendant que le Pod se termine et se redémarre, testez la route `/` à plusieurs reprises pour confirmer que l'application reste accessible :

```powershell
# Tester toutes les 1 seconde :
while ($true) {
    $response = curl "$(minikube service kubeapp --url)/" -s
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - $response"
    Start-Sleep -Seconds 1
}
```

Ou plus simplement :

```powershell
for ($i = 0; $i -lt 10; $i++) {
    curl "$(minikube service kubeapp --url)/"
    Start-Sleep -Seconds 1
}
```

**Résultat attendu** :

Vous continuerez de recevoir des réponses sans erreur. Les hostnames changeront (round-robin entre les Pods restants), mais aucune interruption ne sera visible.

```
🚀 Nouvelle version déployée !
App: KubeApp
Env: production
Host: kubeapp-7db8f9c6fd-ldm2x

🚀 Nouvelle version déployée !
App: KubeApp
Env: production
Host: kubeapp-7db8f9c6fd-ghz7t

(pas d'erreur, l'application continue de répondre)
```

---

## Étape 5 — Vérifier via le Dashboard

Ouvrez le Kubernetes Dashboard pour observer visuellement le redémarrage :

```powershell
minikube dashboard
```

Allez dans la section **Workloads → Deployments → kubeapp**. Vous verrez :

- Le Deployment toujours avec **3 replicas** (nombre maintenu automatiquement)
- L'historique des Pods montrant le nouveau Pod créé
- Les événements affichant "Created pod" ou "Pod created"

---

## Concepts validés

- **Self-Healing** : Kubernetes détecte automatiquement les Pods défaillants et les redémarre.
- **Zéro Downtime** : Grâce aux réplicas, le service reste accessible même pendant un redémarrage.
- **Haute Disponibilité** : Le Deployment maintient automatiquement le nombre souhaité de replicas actives.

**Résumé du comportement :**

1. ✅ Appel à `/exit` → le conteneur s'arrête
2. ✅ Kubernetes détecte l'anomalie immédiatement
3. ✅ Un nouveau Pod est créé pour maintenir 3 replicas
4. ✅ Le Service continue de router le trafic vers les Pods disponibles
5. ✅ Aucune interruption côté client → **zéro downtime**

---

## Bonnes pratiques

1. **Utilisez les health checks** (`livenessProbe`, `readinessProbe`) pour détecter les Pods malsains.
2. **Définissez les ressources** (CPU, mémoire) pour permettre à Kubernetes d'optimiser la distribution.
3. **Utilisez les affinity rules** pour contrôler la distribution des Pods sur les nœuds.
4. **Monitorez les événements** : `kubectl describe deployment kubeapp` pour voir les événements récents.

---

## Ressources utiles

- Afficher les événements du Deployment :

  ```powershell
  kubectl describe deployment kubeapp
  ```

- Afficher les logs du Pod actuel :

  ```powershell
  kubectl logs deployment/kubeapp
  ```

- Afficher les informations détaillées d'un Pod :

  ```powershell
  kubectl describe pod <pod-name>
  ```

- Supprimer manuellement un Pod (simulation de défaillance) :

  ```powershell
  kubectl delete pod <pod-name>
  ```

---

## Fin

Étape 9 complétée ✅

Vous avez maintenant exploré les capacités essentielles de Kubernetes :

- Déploiement d'applications
- Réplication et scaling
- Exposition des services
- Intégration de bases de données
- Mise à jour en continu (rolling updates)
- Self-healing et haute disponibilité

Félicitations pour avoir complété cette série de tutoriels Kubernetes ! 🎉
