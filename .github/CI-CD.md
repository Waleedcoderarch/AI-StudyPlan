# CI/CD — Dev → Staging → Production

```text
feature branch
    ↓
PR checks + terraform plan (infra changes)
    ↓
merge to main ──────────────► auto deploy DEV
    ↓
promote (manual / staging branch) ► deploy STAGING  (test here)
    ↓
manual approval + confirm   ► deploy PROD
```

Nothing goes to **prod** automatically.

## Workflows

| Workflow | Trigger | Environment |
|----------|---------|-------------|
| `deploy-dev.yml` | Push to `main` | Dev (auto) |
| `deploy-staging.yml` | Push to `staging` branch **or** Actions → Run workflow | Staging |
| `deploy-prod.yml` | Actions → Run workflow only (type `deploy-prod`) | Production (approval) |
| `terraform-plan.yml` | PRs touching `infra/` | Plan only |
| `reusable-ecs-deploy.yml` | Called by other workflows | Shared build/deploy |

## How developers promote a release

1. Merge to `main` → wait for **DEV** Actions to go green  
2. Note the commit SHA (e.g. `bf27c92`)  
3. **Actions → Deploy Staging → Run workflow** (optional: paste that SHA)  
4. Test on the staging ALB URL  
5. Only when staging looks good: **Actions → Deploy Production → Run workflow**  
   - `git_ref` = same SHA tested on staging  
   - `confirm` = `deploy-prod`  
6. Approve the GitHub **production** environment if protection rules are enabled  

## One-time GitHub setup

### Secrets (Settings → Secrets and variables → Actions)

| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | Deploy credentials |
| `AWS_SECRET_ACCESS_KEY` | Deploy credentials |
| `GROQ_API_KEY` | Terraform plan |
| `ALERT_EMAIL` | Terraform plan / budgets |

### Variables

| Variable | Purpose |
|----------|---------|
| `STAGING_ALB_URL` | `http://ai-studyplan-staging-alb-524443134.us-east-1.elb.amazonaws.com` |
| `PROD_ALB_URL` | Prod app URL (set after prod Terraform apply) |
| `DEPLOY_SNS_TOPIC_ARN` | Optional deploy email topic |

### Environments (Settings → Environments)

Create:

1. **`staging`** — optional reviewers  
2. **`production`** — **required reviewers** (so prod cannot deploy without a human)

## Terraform environments

```text
infra/environments/
  dev/       # live
  staging/   # pre-prod test
  prod/      # production (apply when ready)
```

## Notifications

- GitHub Actions status (enable Actions notifications)  
- Optional SNS email if `DEPLOY_SNS_TOPIC_ARN` is set  
- Staging/prod budget alerts from Terraform `cost_alerts` module  
