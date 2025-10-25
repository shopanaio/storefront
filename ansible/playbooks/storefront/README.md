# Storefront Deployment

Ansible playbooks for deploying the Next.js Storefront via Traefik on sandbox server.

## Structure

```
storefront/
├── deploy.yml                 # Deploy via Traefik
├── docker-compose.yml.j2      # Compose template with Traefik labels
├── sandbox.vars.yml           # Variables for sandbox environment
└── README.md                  # This documentation
```

## Requirements

- Docker on remote server
- Traefik running on remote server and connected to `shopana-network`
- `hosts.ini` configured with `shopana_sandbox`
- Variables `shopana_ghcr_owner` and `shopana_ghcr_token` available to Ansible

## Сборка образа

Вариант A — через Ansible playbook (рекомендуется):

```bash
# Сборка и пуш latest
ansible-playbook ansible/playbooks/storefront/build.yml

# С конкретным тегом и брендом
ansible-playbook ansible/playbooks/storefront/build.yml \
  -e "image_tag=v1.0.0" \
  -e "BRAND=mybrand"

# Переопределить GraphQL URL/API Key (если нужно)
ansible-playbook ansible/playbooks/storefront/build.yml \
  -e "SHOPANA_GRAPHQL_URL=/api/client/graphql/query" \
  -e "SHOPANA_API_KEY=$SHOPANA_API_KEY"
```

Вариант B — вручную docker build:

```bash
cd /Users/phl/Projects/shopana-io/services
docker build -t ghcr.io/${SHOPANA_GHCR_OWNER}/storefront:latest \
  --build-arg CMS=shopana \
  --build-arg BRAND=default \
  --build-arg SHOPANA_GRAPHQL_URL=/api/client/graphql/query \
  --build-arg SHOPANA_API_KEY="${SHOPANA_API_KEY:-}" \
  storefront
echo "$SHOPANA_GHCR_TOKEN" | docker login ghcr.io -u "$SHOPANA_GHCR_OWNER" --password-stdin
docker push ghcr.io/${SHOPANA_GHCR_OWNER}/storefront:latest
```

## Deploy

```bash
# Deploy to sandbox (latest tag)
ansible-playbook ansible/playbooks/storefront/deploy.yml \
  -i ansible/hosts.ini \
  --limit shopana_sandbox

# Deploy specific version
ansible-playbook ansible/playbooks/storefront/deploy.yml \
  -i ansible/hosts.ini \
  --limit shopana_sandbox \
  -e "image_tag=v1.0.0"
```

## Traefik

Sandbox defaults route all traffic to the storefront using `PathPrefix(`/`)`.
If you also deploy Admin UI on the same host, adjust `storefront_traefik_router_rule` to use Host-based rule (e.g., `Host(`storefront.example.com`)`) or a different path prefix.
