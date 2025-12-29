# Docker Configuration - Queen Mama

Documentation complète de la configuration Docker optimisée pour le projet Queen Mama.

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Commandes Makefile](#-commandes-makefile)
- [Configuration des ports](#-configuration-des-ports)
- [Volumes nommés](#-volumes-nommés)
- [Health checks](#-health-checks)
- [Environnements](#-environnements)
- [Troubleshooting](#-troubleshooting)

## 🎯 Vue d'ensemble

La configuration Docker a été optimisée pour résoudre les problèmes récurrents et faciliter le développement.

### Problèmes résolus

| Problème | Solution |
|----------|----------|
| Prisma binary mismatch (arm64/x64) | binaryTargets multi-plateforme dans schema.prisma |
| Volumes stales / node_modules obsolètes | Volumes nommés explicites + `make rebuild` |
| Conflits de ports avec autres apps | Ports configurables via variables d'environnement |
| Build context trop volumineux | `.dockerignore` complet |
| Pas de healthcheck | Endpoints `/health` sur API et Web |
| Pas de config production | `docker-compose.prod.yml` avec Traefik + SSL |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Development                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Web    │  │   API    │  │  MinIO   │             │
│  │  :3002   │  │  :3003   │  │ :9000/01 │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│       │             │              │                    │
│       └─────────────┼──────────────┘                    │
│                     │                                   │
│       ┌─────────────┴──────────────┐                   │
│       │                            │                    │
│  ┌─────────┐                 ┌─────────┐               │
│  │ Postgres│                 │  Redis  │               │
│  │  :5432  │                 │  :6380  │               │
│  └─────────┘                 └─────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Production                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │              Traefik (SSL)                   │      │
│  │         :80 → :443 (Auto SSL)                │      │
│  └───────┬──────────────────────────────┬───────┘      │
│          │                              │              │
│     ┌────▼─────┐                  ┌────▼─────┐        │
│     │   Web    │                  │   API    │        │
│     │  :3000   │                  │  :3003   │        │
│     └──────────┘                  └──────────┘        │
│          │                              │              │
│          └──────────────┬───────────────┘              │
│                         │                              │
│          ┌──────────────┴────────────┐                 │
│          │    Internal Network       │                 │
│     ┌────▼─────┐  ┌────▼─────┐  ┌───▼────┐           │
│     │ Postgres │  │  Redis   │  │ MinIO  │           │
│     │ (hidden) │  │ (hidden) │  │        │           │
│     └──────────┘  └──────────┘  └────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Commandes Makefile

Le `Makefile` fournit des commandes simplifiées pour gérer Docker.

### Développement

```bash
# Démarre uniquement l'infrastructure (DB, Redis, MinIO)
# Recommandé pour le dev local avec hot-reload
make dev

# Démarre TOUS les services dans Docker (API + Web + infra)
make dev-full

# Arrête tous les conteneurs
make stop
```

### Maintenance

```bash
# Nettoie les volumes node_modules et rebuild
# Résout les problèmes de binaires Prisma obsolètes
make rebuild

# Supprime uniquement les volumes node_modules (garde les données)
make clean-volumes

# Supprime TOUS les conteneurs ET volumes (⚠️ données incluses!)
make clean
```

### Logs & Monitoring

```bash
# Suit les logs API et Web en temps réel
make logs

# Logs API uniquement
make logs-api

# Logs Web uniquement
make logs-web

# Affiche le status et les ports de tous les conteneurs
make status
```

### Database

```bash
# Exécute les migrations Prisma dans le conteneur
make db-migrate

# Ouvre Prisma Studio (connecte à la DB Docker)
make db-studio
```

### Production

```bash
# Build les images de production
make prod-build

# Démarre le stack production (avec Traefik)
make prod-up

# Arrête le stack production
make prod-down
```

## 🔧 Configuration des ports

Tous les ports sont configurables via des variables d'environnement pour éviter les conflits.

### Ports par défaut

| Service | Port par défaut | Variable d'environnement |
|---------|----------------|-------------------------|
| Web | 3002 | `QM_WEB_PORT` |
| API | 3003 | `QM_API_PORT` |
| PostgreSQL | 5432 | `QM_POSTGRES_PORT` |
| Redis | 6380 | `QM_REDIS_PORT` |
| MinIO API | 9000 | `QM_MINIO_API_PORT` |
| MinIO Console | 9001 | `QM_MINIO_CONSOLE_PORT` |

### Méthode 1 : Fichier `.env` (recommandé)

Créez un fichier `.env` à la racine du projet :

```bash
# .env
QM_WEB_PORT=3100
QM_API_PORT=3101
QM_POSTGRES_PORT=5433
QM_REDIS_PORT=6381
QM_MINIO_API_PORT=9010
QM_MINIO_CONSOLE_PORT=9011
```

Ensuite :

```bash
make dev-full
```

### Méthode 2 : Variables d'environnement en ligne

```bash
QM_API_PORT=3100 QM_WEB_PORT=3101 make dev-full
```

### Méthode 3 : Export dans le shell

```bash
export QM_API_PORT=3100
export QM_WEB_PORT=3101
make dev-full
```

## 📦 Volumes nommés

Les volumes sont explicitement nommés pour une gestion claire et éviter les volumes orphelins.

### Volumes de développement

```bash
qm_api_node_modules       # node_modules de l'API
qm_packages               # packages partagés (Prisma, etc.)
qm_web_node_modules       # node_modules du Web
qm_web_next               # Cache .next de Next.js
```

### Volumes de données (persistants)

```bash
qm_postgres_data          # Données PostgreSQL
qm_redis_data             # Données Redis
qm_minio_data             # Données MinIO (fichiers)
```

### Gestion des volumes

```bash
# Lister les volumes
docker volume ls | grep qm_

# Supprimer uniquement les volumes de dev
make clean-volumes

# Supprimer TOUS les volumes (⚠️ données incluses!)
make clean

# Inspecter un volume
docker volume inspect qm_postgres_data
```

### Pourquoi des volumes nommés ?

Les volumes nommés résolvent le problème des **binaires Prisma obsolètes** :

1. **Traçabilité** : On sait exactement quels volumes existent
2. **Nettoyage facile** : `make rebuild` supprime et recrée proprement
3. **Pas de volumes orphelins** : Les volumes anonymes s'accumulent dans Docker
4. **Debug facile** : `docker volume ls | grep qm_` montre l'état

## 🩺 Health Checks

Des endpoints de health check permettent à Docker et aux orchestrateurs de monitorer l'état des services.

### API (NestJS)

**Endpoint basique** : `GET /health`

```bash
curl http://localhost:3003/health

# Réponse
{
  "status": "ok",
  "timestamp": "2025-12-29T18:00:00.000Z",
  "uptime": 123.456
}
```

**Endpoint avec dépendances** : `GET /health/ready`

```bash
curl http://localhost:3003/health/ready

# Réponse
{
  "status": "ok",
  "timestamp": "2025-12-29T18:00:00.000Z",
  "uptime": 123.456,
  "checks": {
    "database": "ok"
  }
}
```

### Web (Next.js)

**Endpoint** : `GET /api/health`

```bash
curl http://localhost:3002/api/health

# Réponse
{
  "status": "ok",
  "timestamp": "2025-12-29T18:00:00.000Z",
  "uptime": 123.456
}
```

### Configuration Docker

Les healthchecks sont définis dans `docker-compose.yml` :

```yaml
api:
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3003/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
```

**Statut des healthchecks** :

```bash
make status

# ou
docker compose ps
```

## 🌍 Environnements

### Development (`docker-compose.yml`)

**Caractéristiques** :
- Hot-reload via bind mounts
- Ports exposés pour accès direct
- Pas de SSL
- Variables par défaut

**Usage** :

```bash
# Infra uniquement (recommandé)
make dev

# Tout dans Docker
make dev-full
```

### Production (`docker-compose.prod.yml`)

**Caractéristiques** :
- Traefik reverse proxy avec SSL automatique (Let's Encrypt)
- Réseau interne pour DB/Redis (non exposés)
- Resource limits (CPU/RAM)
- Rate limiting sur API
- Healthchecks avancés
- Images depuis registry Docker

**Configuration requise** :

Copiez et éditez `.env.prod.example` :

```bash
cp .env.prod.example .env.prod
nano .env.prod  # Éditez les valeurs
```

**Déploiement** :

```bash
# Build
make prod-build

# Démarrage
make prod-up

# Migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Logs
docker compose -f docker-compose.prod.yml logs -f

# Arrêt
make prod-down
```

**Accès** :
- Web : `https://votredomaine.com`
- API : `https://api.votredomaine.com`
- Traefik Dashboard : `https://traefik.votredomaine.com`
- MinIO Console : `https://minio.votredomaine.com`

## 🆘 Troubleshooting

### 1. Prisma Binary Mismatch

**Symptôme** :
```
Error: Prisma Client could not locate the Query Engine for runtime "linux-musl-arm64"
```

**Solution** :
```bash
make rebuild
```

**Explication** : Les volumes nommés sont supprimés et recréés proprement avec les bons binaires.

---

### 2. Port Already Allocated

**Symptôme** :
```
Error: Bind for 0.0.0.0:3003 failed: port is already allocated
```

**Solution 1** : Utilisez des ports alternatifs
```bash
QM_API_PORT=3100 QM_WEB_PORT=3101 make dev-full
```

**Solution 2** : Tuez le processus qui utilise le port
```bash
# macOS/Linux
lsof -ti:3003 | xargs kill -9
```

**Solution 3** : Créez un `.env` avec des ports personnalisés (voir [Configuration des ports](#-configuration-des-ports))

---

### 3. Permission Denied sur volumes

**Symptôme** :
```
Error: EACCES: permission denied, mkdir '/app/apps/web/.next/server'
```

**Solution** :
```bash
make clean-volumes
make dev-full
```

**Note** : Le stage `development` du Dockerfile web tourne en root pour compatibilité avec les volumes Docker. Le stage `production` utilise un user non-root.

---

### 4. Disk Space Issues

**Symptôme** :
```
no space left on device
```

**Solution** :
```bash
# Nettoyer tous les caches Docker
docker system prune -af --volumes

# Nettoyer uniquement les images non utilisées
docker image prune -a

# Nettoyer les volumes orphelins
docker volume prune
```

---

### 5. Services ne démarrent pas

**Diagnostic** :

```bash
# Vérifier le statut
make status

# Voir les logs
make logs

# Logs d'un service spécifique
docker compose logs postgres
docker compose logs api
```

**Solution générale** :
```bash
# Redémarrer proprement
make stop
make dev
```

---

### 6. Hot-reload ne fonctionne pas

**Web (Next.js)** :

Vérifiez que `WATCHPACK_POLLING=true` dans le Dockerfile :

```dockerfile
ENV WATCHPACK_POLLING=true
```

**API (NestJS)** :

Le bind mount doit pointer sur `src` uniquement :

```yaml
volumes:
  - ./apps/api/src:/app/apps/api/src:delegated
```

---

### 7. Build trop lent

**Solutions** :

1. **Vérifier `.dockerignore`** :
   ```bash
   cat .dockerignore
   ```

2. **Utiliser le cache de build** :
   ```bash
   docker compose build
   # Le cache BuildKit est automatiquement utilisé
   ```

3. **Build sans cache (si nécessaire)** :
   ```bash
   docker compose build --no-cache
   ```

---

## 📝 Bonnes pratiques

### Pour le développement

1. **Utilisez `make dev`** au lieu de tout dans Docker
   - Hot-reload plus rapide
   - Debug plus facile
   - Moins de ressources consommées

2. **Committez rarement les volumes**
   ```bash
   # Avant de commit
   make stop
   ```

3. **Nettoyez régulièrement**
   ```bash
   # Toutes les 2 semaines
   docker system prune -a
   ```

### Pour la production

1. **Toujours builder les images avant deploy**
   ```bash
   make prod-build
   ```

2. **Vérifiez les healthchecks**
   ```bash
   make status
   curl https://api.votredomaine.com/health/ready
   ```

3. **Monitorer les logs**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f --tail=100
   ```

4. **Backup régulier des données**
   ```bash
   docker run --rm -v qm_postgres_data_prod:/data -v $(pwd):/backup alpine tar czf /backup/postgres-$(date +%Y%m%d).tar.gz /data
   ```

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Prisma in Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker](https://docs.nestjs.com/recipes/docker)
