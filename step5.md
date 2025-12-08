# Étape 5 — Exposition du Deployment

Votre application n’est pas encore accessible depuis l’extérieur du cluster.

## Travail demandé

- Créer un Service de type **NodePort** pour exposer votre Deployment.
- Vérifier les informations du Service (type, ports, sélecteurs, etc.).
- Utiliser les fonctionnalités de Minikube pour rendre le Service accessible depuis votre navigateur (par exemple, via un tunnel ou une commande dédiée).
- Tester la route `/` depuis un navigateur ou un client HTTP et vérifier que le message renvoyé contient bien le hostname du Pod.

---

## Informations sur le Deployment

- **Nom du Deployment** : `kubeapp`
- **Objectif** : Rendre l’application accessible depuis l’extérieur du cluster (navigateur, Postman, etc.).

---

## 1. Créer un Service NodePort (commande impérative)

```sh
kubectl expose deployment kubeapp \
    --type=NodePort \
    --port=3000
```

- `--port=3000` : Port de l’application Node.js dans le conteneur.
- Kubernetes choisira automatiquement un `nodePort` entre `30000–32767`.

---

## 2. Vérifier les informations du Service

```sh
kubectl get service kubeapp
```

Exemple de résultat :

```
NAME     TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)           AGE
kubeapp  NodePort   10.96.183.12    <none>        3000:31234/TCP    10s
```

- Ici, `31234` est un exemple de NodePort (le vôtre peut être différent).

Pour plus de détails :

```sh
kubectl describe service kubeapp
```

**Points importants :**

- **Type** : NodePort
- **Selector** : `app=kubeapp`
- **Ports** :
  - `port 3000` (service)
  - `nodePort 3xxxx` (externe)

---

## 3. Rendre le Service accessible dans votre navigateur

Avec Minikube, deux options :

### Option A : `minikube service` (recommandée pour le navigateur)

```sh
minikube service kubeapp
```

- Minikube ouvre automatiquement votre navigateur sur l’URL du Service.

### Option B : Utiliser `minikube tunnel`

Si la commande `minikube service` ne fonctionne pas (rare) :

1. Lancez le tunnel dans un terminal :

   ```sh
   minikube tunnel
   ```

2. Récupérez l’IP du nœud Minikube :

   ```sh
   minikube ip
   ```

3. Ouvrez votre navigateur à l’adresse suivante :

   ```
   http://MINIKUBE_IP:NODE_PORT/
   ```

   Par exemple :

   ```
   http://192.168.49.2:31234/
   ```

---

## 4. Tester la route `/`

Accéder via navigateur ou `curl` :

- Navigateur :  
   `http://localhost:XXXXX/`  
   ou  
   `http://minikube_ip:nodePort/`

- Curl :

  ```sh
  curl $(minikube service kubeapp --url)
  ```

**Résultat attendu :**

```
Hello World 🌍 — Hostname: kubeapp-7df4c8f4f9-abcde
```

Cela prouve que le Pod qui répond affiche bien son hostname.

---

### Bonus : Tester plusieurs fois pour voir les Pods différents

```sh
for i in {1..10}; do curl $(minikube service kubeapp --url); done
```

Vous verrez le hostname changer : c’est le LoadBalancing interne du Service.

Fin de l'étape 5
