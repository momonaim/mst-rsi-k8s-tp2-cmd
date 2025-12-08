# Étape 3 — Installation et démarrage de Minikube

Dans cette étape, vous allez préparer votre environnement Kubernetes local.

## Objectif

Préparer un cluster Kubernetes local avec Minikube, vérifier les outils requis et s'assurer que le cluster est opérationnel.

## Travail demandé

- Vérifier la présence de `minikube` et `kubectl` sur la machine, ou les installer.
- Démarrer un cluster Minikube local.
- Vérifier l'état du cluster (version, contexte, nœud).

---

## 1. Vérifier si Minikube est installé

```powershell
minikube version
```

Si la commande renvoie une version, `minikube` est installé. Sinon, installez-le selon votre OS :

- **Windows (PowerShell administrateur & Chocolatey) :**
  ```powershell
  choco install minikube -y
  ```
- **macOS (Homebrew) :**
  ```bash
  brew install minikube
  ```
- **Linux (Ubuntu/Debian) :**
  ```bash
  curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  sudo install minikube-linux-amd64 /usr/local/bin/minikube
  ```

---

## 2. Vérifier si `kubectl` est installé

```powershell
kubectl version --client
```

Si absent, installez-le :

- **Windows (Chocolatey) :**
  ```powershell
  choco install kubernetes-cli -y
  ```
- **macOS (Homebrew) :**
  ```bash
  brew install kubectl
  ```
- **Linux (Ubuntu/Debian) :**
  ```bash
  sudo apt install -y kubectl
  ```

---

## 3. Démarrer Minikube

Par défaut, Minikube utilise le driver disponible (Docker Desktop, Hyper-V, VirtualBox...).  
Sur Windows, si Docker Desktop est installé, Minikube peut utiliser le driver `docker`.

Lancer Minikube :

```powershell
minikube start
```

Options utiles :

- Forcer le driver Docker :  
   `minikube start --driver=docker`
- Allouer plus de ressources :  
   `minikube start --memory=4096 --cpus=2`

---

## 4. Vérifications post-démarrage

- **Version Kubernetes utilisée :**
  ```powershell
  kubectl version --output=yaml
  ```
- **Contexte courant (vous devez voir `minikube`) :**
  ```powershell
  kubectl config get-contexts
  kubectl config current-context
  ```
- **État des nœuds :**
  ```powershell
  kubectl get nodes
  ```

Exemple de sortie attendue :

```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1m    v1.29.x
```

---

## 5. Dépannage rapide

- Si `minikube start` échoue, relancez avec `--driver=docker` si Docker Desktop est installé.
- Voir les logs :  
   `minikube logs`
- Redémarrer Minikube :  
   `minikube stop; minikube delete; minikube start`

---

## 6. Commandes récapitulatives (PowerShell)

```powershell
# Vérifier les outils
minikube version
kubectl version --client

# Démarrer Minikube
minikube start

# Vérifier le cluster
kubectl config current-context
kubectl get nodes
```

---

**Fin de l'étape 3**
