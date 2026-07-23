# Infrastructure — AI StudyPlan (ECS / Terraform)

Deploys the existing app to **AWS ECS Fargate** in **us-east-1** using Terraform modules.

## Architecture (cost-aware)

| Layer | Service | Notes |
|-------|---------|--------|
| Network | VPC + public subnets | No NAT in default (saves ~$32/mo) |
| Compute | ECS Fargate | Autoscale server on CPU |
| Images | ECR | Lifecycle: keep last 5 tags |
| Load balancer | ALB | `/api/*` → server, `/*` → client |
| Data | EFS + SQLite | Persist DB across restarts; single-writer friendly |
| Secrets | Secrets Manager | Groq API key |
| Cost | Budgets + SNS | Email alerts at 80% / 100% |

```text
Internet → ALB → ECS client (nginx)
                → ECS server (Node/Express) → EFS (SQLite)
```

## Layout

```text
infra/
  modules/          # vpc, ecr, alb, efs, ecs, cost_alerts
  environments/
    dev/            # small / cheap (auto CI)
    staging/        # pre-prod test before production
    prod/           # larger + autoscaling (manual promote only)
docker/
  server/Dockerfile
  client/Dockerfile
```

## 1. Configure AWS credentials (do NOT paste keys in chat)

```powershell
aws configure
# AWS Access Key ID: <your key>
# AWS Secret Access Key: <your secret>
# Default region: us-east-1
# Default output: json
```

Verify:

```powershell
aws sts get-caller-identity
```

## 2. Deploy infrastructure (dev)

```powershell
cd infra\environments\dev
copy terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set alert_email
# Pass Groq key at apply time (preferred) or add groq_api_key to tfvars (gitignored)

terraform init
terraform plan -var="groq_api_key=YOUR_GROQ_KEY" -var="alert_email=you@example.com"
terraform apply -var="groq_api_key=YOUR_GROQ_KEY" -var="alert_email=you@example.com"
```

Confirm the SNS email subscription when AWS sends it.

## 3. Build and push images

From repo root (after `terraform apply`, use output URLs):

```powershell
$ACCOUNT = aws sts get-caller-identity --query Account --output text
$REGION = "us-east-1"
$SERVER_REPO = "<ecr_server_url from terraform output>"
$CLIENT_REPO = "<ecr_client_url from terraform output>"

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

docker build -f docker/server/Dockerfile -t "${SERVER_REPO}:latest" .
docker build -f docker/client/Dockerfile -t "${CLIENT_REPO}:latest" .
docker push "${SERVER_REPO}:latest"
docker push "${CLIENT_REPO}:latest"
```

Force a new deployment:

```powershell
aws ecs update-service --cluster <cluster_name> --service <server_service> --force-new-deployment --region us-east-1
aws ecs update-service --cluster <cluster_name> --service <client_service> --force-new-deployment --region us-east-1
```

Open the `alb_url` from Terraform outputs.

## 4. Prod

Same steps under `infra/environments/prod` with larger CPU/memory and min 2 tasks.

## Security notes

- Never commit `*.tfvars` with secrets, access keys, or API keys.
- Never paste AWS access/secret keys into Cursor chat.
- Use IAM user with least privilege for Terraform (or SSO).

## Scale / cost notes

- SQLite on EFS is fine for early traffic; for 10k–50k concurrent users, plan a move to **RDS PostgreSQL**.
- Keep Container Insights off in dev.
- Raise `monthly_budget_usd` only when you need more capacity.
