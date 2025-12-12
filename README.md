# TP Kubernetes & Minikube — Déploiement d'une Application Node.js

Bienvenue dans ce TP complet sur le déploiement d'une application Node.js avec MySQL sur Kubernetes, en utilisant Minikube pour la simulation d'un cluster local.

## Objectif du TP

- Découvrir les concepts fondamentaux de Kubernetes (Pods, Deployments, Services, ConfigMap, Secret, rolling update, self-healing...)
- Prendre en main Minikube pour simuler un cluster Kubernetes local
- Déployer, exposer, mettre à jour et superviser une application Node.js conteneurisée
- Intégrer une base de données MySQL et gérer la configuration de façon sécurisée

## Prérequis

- Docker installé et configuré
- Node.js (>= 18)
- Minikube et kubectl installés
- Un compte Docker Hub

## Plan du TP

Le TP est découpé en 9 étapes progressives. Chaque étape est documentée dans un fichier markdown dédié :

| Étape | Sujet                                       | Lien                   |
| ----- | ------------------------------------------- | ---------------------- |
| 1     | Création de l'application Node.js           | [step1.md](./step1.md) |
| 2     | Création de l'image Docker et publication   | [step2.md](./step2.md) |
| 3     | Installation et démarrage de Minikube       | [step3.md](./step3.md) |
| 4     | Déploiement de l'application sur Kubernetes | [step4.md](./step4.md) |
| 5     | Exposition du service NodePort              | [step5.md](./step5.md) |
| 6     | Intégration MySQL, ConfigMap & Secret       | [step6.md](./step6.md) |
| 7     | Rolling update (mise à jour continue)       | [step7.md](./step7.md) |
| 8     | Vérifications via navigateur et dashboard   | [step8.md](./step8.md) |
| 9     | Self-healing et haute disponibilité         | [step9.md](./step9.md) |

Chaque étape contient :

- Un objectif clair
- Les commandes à exécuter (PowerShell)
- Les bonnes pratiques
- Les points de vérification

## Conseils

- Suivez les étapes dans l'ordre pour bien comprendre la progression
- N'hésitez pas à consulter la documentation officielle de Kubernetes et Minikube
- Utilisez le dashboard Minikube pour visualiser l'état du cluster
- En cas de problème, vérifiez les logs des Pods et l'état des ressources avec `kubectl`

Bon TP et bonne découverte de Kubernetes ! 🚀
