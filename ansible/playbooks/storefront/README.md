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

## Build Image

Option A — via Ansible playbook (recommended):

```bash
# Build and push latest
ansible-playbook ansible/playbooks/storefront/build.yml

# With specific tag and brand
ansible-playbook ansible/playbooks/storefront/build.yml \
  -e "image_tag=v1.0.0" \
  -e "BRAND=mybrand"

# Override GraphQL URL/API Key (if needed)
ansible-playbook ansible/playbooks/storefront/build.yml \
  -e "SHOPANA_GRAPHQL_URL=/api/client/graphql/query" \
  -e "SHOPANA_API_KEY=$SHOPANA_API_KEY"
```

Option B — manual docker build:

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

## Trigger GitHub Actions (gh)

Trigger the build workflow via GitHub CLI:

```bash
# Requires gh installed and authenticated (run `gh auth login`)
# Uses defaults from sandbox.vars.yml automatically
ansible-playbook ansible/playbooks/storefront/trigger-gh-workflow.yml \
  -e gh_repo_owner=shopana-io \
  -e gh_repo_name=storefront \
  -e gh_ref=main \
  -e workflow_file=.github/workflows/storefront-build.yml \
  -e image_tag=v1.2.3 \
  -e BRAND=xyz \
  -e CMS=shopana \
  -e SHOPANA_GRAPHQL_URL=https://sandbox.shopana.io/api/client/graphql/query \
  -e PORT=3000 \
  -e SHOPANA_API_KEY=$SHOPANA_API_KEY \
  -e NEXT_PUBLIC_APP_URL=https://bento.shopana.io \
  -e platforms="linux/amd64,linux/arm64" \
  -e gh_wait=true
```

Notes:
- `NEXT_PUBLIC_APP_URL` and `platforms` are optional; you may omit them.
- If `gh_wait=true`, the playbook waits for the workflow to finish and returns the exit status.

Quick start using only sandbox defaults:

```bash
# Define only what you want to override (e.g., image_tag and API key)
ansible-playbook ansible/playbooks/storefront/trigger-gh-workflow.yml \
  -e image_tag=v1.2.3 \
  -e SHOPANA_API_KEY=$SHOPANA_API_KEY
```

## Traefik

Sandbox defaults route all traffic to the storefront using `PathPrefix(`/`)`.
If you also deploy Admin UI on the same host, adjust `storefront_traefik_router_rule` to use Host-based rule (e.g., `Host(`storefront.example.com`)`) or a different path prefix.
