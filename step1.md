Étape 1 — Préparation de l’application Node.js

## Objectif

Préparer une petite application Node.js (Express) permettant de :

- afficher « Hello World » suivi du `hostname` sur la route `/` ;
- arrêter proprement le serveur via la route `/exit`.

## Arborescence minimale

```
kubeapp/
├── app.js
├── package.json
```

## Fichier `package.json`

Copiez ce contenu dans `package.json` :

```json
{
  "name": "kubeapp",
  "version": "1.0.0",
  "main": "app.js",
  "license": "MIT",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {}
}
```

## Exemple de `app.js`

Le code suivant implémente le comportement attendu :

- Le code suivant implémente le comportement attendu sans dépendance externe (module `http` natif) :

```js
const http = require("http");
const os = require("os");

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Hello World from ${os.hostname()}`);
    return;
  }

  if (req.method === "GET" && req.url === "/exit") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Shutting down");
    // ferme le serveur puis termine le process
    server.close(() => process.exit(0));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
```

## Étapes pour tester localement

1. Installer les dépendances :

```powershell
npm install
```

2. Démarrer l'application :

```powershell
npm start
```

3. Vérifier les routes depuis un navigateur ou `curl` :

- `http://localhost:3000` → doit renvoyer `Hello World from <hostname>`
- `http://localhost:3000/exit` → doit renvoyer `Shutting down` et arrêter le serveur

## Remarques

- La route `/exit` appelle `server.close()` puis `process.exit(0)` pour un arrêt propre. En environnement de production, évitez d'exposer une telle route sans authentification.
- Vous pouvez changer le port via la variable d'environnement `PORT`.

## Conseil rapide

Pour tester en local rapidement :

```powershell
npm install; npm start
# puis dans un autre terminal
curl http://localhost:3000
curl http://localhost:3000/exit
```

Fin de l'étape 1
