# CI/CD

GitHub Actions deploys **dev** automatically when you push app/docker changes to `main`.

## What happens on push

```text
git push → GitHub Actions
  → build Docker images
  → push to ECR
  → force new ECS deployment
  → wait until stable
  → health check
  → optional SNS email notification
```

Workflows:
- `.github/workflows/deploy-dev.yml` — build + deploy (on push to `main`)
- `.github/workflows/terraform-plan.yml` — `terraform plan` on PRs that touch `infra/`

## One-time setup (GitHub secrets)

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value |
|--------|--------|
| `AWS_ACCESS_KEY_ID` | IAM access key (same user used for Terraform, or a deploy-only user) |
| `AWS_SECRET_ACCESS_KEY` | Matching secret key |
| `GROQ_API_KEY` | Groq key (for Terraform plan workflow only) |
| `ALERT_EMAIL` | e.g. `waleedahmed22005@gmail.com` |

Optional (Variables, not secrets):

| Variable | Value |
|----------|--------|
| `DEPLOY_SNS_TOPIC_ARN` | SNS topic ARN for deploy emails (from AWS console / Terraform cost alerts topic) |

## GitHub notifications for developers

1. GitHub → **Settings** → **Notifications** → enable **Actions**
2. Or watch the repo → **Custom** → **Actions**
3. Failed/successful runs also show on the **Actions** tab
4. If `DEPLOY_SNS_TOPIC_ARN` is set, email is sent via SNS (confirm the subscription)

## Manual run

Actions → **Deploy Dev (ECS)** → **Run workflow**

## IAM tip

Prefer a dedicated IAM user/role with least privilege: ECR push, ECS update/describe, CloudWatch logs read, SNS publish. Do not commit keys into the repo.
