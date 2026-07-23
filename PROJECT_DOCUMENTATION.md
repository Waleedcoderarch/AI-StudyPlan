# AI Study Hub — Project Documentation

**Repository:** [Waleedcoderarch/AI-StudyPlan](https://github.com/Waleedcoderarch/AI-StudyPlan)  
**Region:** `us-east-1`  
**Cloud account:** `588681235213`  
**Last major update:** July 2026

This document describes everything built for this project from application baseline through AWS infrastructure, CI/CD, observability, and frontend redesign.

---

## 1. Project goal

Deploy the existing **AI Study Hub** (doubt solver, PDF notes generator, quiz generator) on AWS with:

- Infrastructure as Code (**Terraform**)
- Containerized deploy (**Docker + ECS Fargate**)
- Environment separation (**dev → staging → prod**)
- **CI/CD** for automatic and gated releases
- Cost controls (**budgets + SNS alerts**)
- Metrics & dashboards (**Prometheus + Grafana**)
- A polished, brand-first frontend UI

The application itself was already built (React/Vite client + Node/Express server). This engagement focused on **platform, delivery, and product polish**.

---

## 2. Application overview

| Layer | Stack |
|-------|--------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| AI | OpenAI-compatible client → **Groq** (`OPENAI_API_KEY` + `OPENAI_BASE_URL`) |
| Data | SQLite via Sequelize (persisted on **EFS** in AWS) |
| Features | Doubt solver, PDF → notes, quiz generator |

### Repo layout (high level)

```text
AI-StudyPlan/
├── client/                 # React frontend
├── server/                 # Express API
├── docker/                 # App + monitoring images
├── infra/                  # Terraform (modules + environments)
├── .github/workflows/      # CI/CD
└── docs / markdown guides  # This file + CI-CD / monitoring notes
```

---

## 3. Architecture decisions

### Why ECS Fargate (not EKS / Minikube)

Early discussion included Minikube and EKS. The final production path is **ECS Fargate**:

| Option | Decision |
|--------|----------|
| Minikube | Local only — not for AWS scale |
| EKS | Higher fixed cost (~control plane) — deferred |
| **ECS Fargate** | Chosen — simpler ops, pay-per-task, ALB integration |

There are **no Kubernetes Deployment / Service / Ingress** manifests. Equivalents:

| Kubernetes idea | What we use |
|-----------------|-------------|
| Deployment | ECS Service + Task Definition |
| Service / Ingress | ALB + target groups + path rules |
| Pod | Fargate task |
| HPA / ASG nodes | ECS Application Auto Scaling (CPU) |

### Traffic flow

```text
Internet
   ↓
Application Load Balancer
   ├── /api/* , /uploads/*  →  server tasks (:5000)
   ├── /grafana/*           →  monitoring Grafana (:3000)  [staging]
   └── /*                   →  client nginx (:80)
```

---

## 4. What was delivered (timeline)

### Phase A — Project setup

1. Cloned app into `C:\Users\IRUM NAUREEN\Projects\AI-StudyPlan`
2. Kept work in the **same GitHub repo** (`Waleedcoderarch/AI-StudyPlan`) so the original app was not replaced — only extended
3. Connected GitHub CLI as **Waleedcoderarch**
4. Configured AWS CLI (`us-east-1`, IAM user used for Terraform/deploy)

### Phase B — Infrastructure as Code (Terraform)

Modular Terraform under `infra/`:

| Module | Purpose |
|--------|---------|
| `vpc` | VPC, public/private subnets, IGW (NAT off by default to save cost) |
| `ecr` | Container registries for server + client |
| `alb` | Public ALB, target groups, `/api` routing |
| `efs` | Persistent volume for SQLite |
| `ecs` | Fargate cluster, services, CPU autoscaling, Secrets Manager wiring |
| `cost_alerts` | AWS Budgets + SNS email + billing alarm |
| `monitoring` | Prometheus/Grafana/YACE stack + scaling alarms (staging) |

Environments:

| Env | Status | Notes |
|-----|--------|-------|
| **dev** | Live | Small Fargate sizes, CI auto-deploy |
| **staging** | Live | Pre-prod test + Grafana |
| **prod** | Terraform ready | Not applied — manual promote only |

Key app env on ECS server:

- `OPENAI_API_KEY` ← Secrets Manager (Groq key)
- `OPENAI_BASE_URL=https://api.groq.com/openai/v1`
- `OPENAI_MODEL` (e.g. `llama-3.1-8b-instant`)
- `CORS_ORIGIN` ← ALB URL
- `SQLITE_FILE=/data/database.sqlite` (EFS)

### Phase C — Containers

- `docker/server/Dockerfile` — Node API
- `docker/client/Dockerfile` — Vite build + nginx
- Images pushed to ECR; ECS services force-redeployed

### Phase D — CI/CD (GitHub Actions)

| Workflow | Trigger | Action |
|----------|---------|--------|
| `deploy-dev.yml` | Push to `main` (app/docker paths) | Build → ECR → ECS deploy → health check |
| `deploy-staging.yml` | `staging` branch or manual | Deploy to staging |
| `deploy-prod.yml` | Manual only (`confirm=deploy-prod`) | Gated production deploy |
| `terraform-plan.yml` | PRs touching `infra/` | Plan + PR comment |
| `reusable-ecs-deploy.yml` | Shared by env workflows | Common build/deploy steps |

Promotion model:

```text
feature → PR
   ↓
merge to main → DEV (automatic)
   ↓
promote → STAGING (test)
   ↓
manual confirm + approval → PROD
```

Required GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `GROQ_API_KEY`, `ALERT_EMAIL`.

### Phase E — Observability

On **staging**:

- **YACE** — CloudWatch → Prometheus metrics (ECS CPU/memory, ALB traffic/errors)
- **Prometheus** — scrape + alert rules
- **Grafana** — executive dashboard *AI StudyPlan · Reliability Command Center*
- **CloudWatch alarms → SNS** — email on high CPU, ALB 5xx, unhealthy hosts

Grafana URL (staging):

`http://ai-studyplan-staging-alb-524443134.us-east-1.elb.amazonaws.com/grafana/`

Default login (change in Terraform): `admin` / `StudyPlan!Observability`

### Phase F — Frontend redesign

Replaced neon/purple UI with a **brand-first 3D study-plane** experience:

- Fonts: Fraunces + Sora
- Palette: ink / bone / teal / copper
- CSS 3D hero planes + orbit motion
- Cursor parallax, scroll reveals, button sheen, tilt tool panels
- Chat UI aligned to the same design system

---

## 5. Live endpoints

| Environment | URL |
|-------------|-----|
| Dev app | http://ai-studyplan-dev-alb-498635700.us-east-1.elb.amazonaws.com |
| Staging app | http://ai-studyplan-staging-alb-524443134.us-east-1.elb.amazonaws.com |
| Staging Grafana | http://ai-studyplan-staging-alb-524443134.us-east-1.elb.amazonaws.com/grafana/ |
| GitHub Actions | https://github.com/Waleedcoderarch/AI-StudyPlan/actions |

Health check: `GET /api/health`

---

## 6. Cost & budgets

### Services used by this project

VPC, ALB, ECS Fargate, ECR, EFS, Secrets Manager, CloudWatch Logs, AWS Budgets, SNS, (staging) monitoring Fargate task.

**Intentionally avoided for cost:** NAT Gateway (default), EKS control plane, always-on large EC2 ASGs.

### Budgets (approx.)

| Env | Monthly budget setting |
|-----|------------------------|
| Dev | $30 (may be tight with ALB — raise if needed) |
| Staging | $50 |

Alerts email: configured SNS subscription (confirm in inbox).

**Note:** Account-level Cost Explorer may show other workloads (e.g. EKS/WAF). Filter by tag `Project=ai-studyplan` / `Environment` when data is available (billing lag ~24–48h).

Rough steady-state estimate for **dev + staging**: roughly **$75–115 / month** (ALB + Fargate dominate).

---

## 7. Scaling (how it works today)

- **Not** EC2 Auto Scaling Groups
- **ECS Application Auto Scaling** on the **server** service (CPU target ~60%)
- Raise capacity via Terraform vars: `server_min_count`, `server_max_count`, `server_desired_count`
- Or quick CLI: `aws ecs update-service --desired-count N ...`

**Limit:** SQLite on EFS is fine early; for very large concurrency, plan **RDS PostgreSQL**, Redis, and async AI queues.

---

## 8. Disaster recovery (current honesty)

| Present | Not yet |
|---------|---------|
| Multi-AZ subnets / ALB / EFS mounts | Multi-region failover |
| Terraform rebuild path | Automated backup/restore runbooks |
| Secrets in Secrets Manager | Full DR drills |

DR is **basic**. Next steps would be RDS multi-AZ backups, documented RTO/RPO, and optional secondary region.

---

## 9. How to operate day-to-day

### Deploy app (dev)

Push to `main` (changes under `client/`, `server/`, or `docker/`) — Actions builds and deploys.

Or: **Actions → Deploy Dev (ECS) → Run workflow**.

### Promote to staging

**Actions → Deploy Staging → Run workflow** (optionally pass git SHA tested on dev).

### Production (when ready)

1. `terraform apply` under `infra/environments/prod`
2. Create GitHub Environment `production` with required reviewers
3. **Actions → Deploy Production** with `git_ref` + `confirm=deploy-prod`

### Terraform (infra change)

```powershell
cd infra\environments\dev   # or staging / prod
terraform plan
terraform apply
```

Never commit `*.tfvars` with secrets (gitignored).

### Local app run

```powershell
npm run install:all
# server/.env with OPENAI_API_KEY / Groq settings
npm run dev
```

---

## 10. Important fixes along the way

1. **API key naming** — App expects `OPENAI_API_KEY`, not `GROQ_API_KEY`. ECS maps the Groq secret correctly with Groq base URL.
2. **CI credentials** — First Actions failure was missing GitHub AWS secrets; fixed after secrets were added; deploy then succeeded.
3. **Same-repo infra** — Terraform/Docker added beside `client/` and `server/` without rewriting the core product logic (CORS env support was a small additive change).

---

## 11. Suggested next steps

1. Raise/adjust budgets after a full month of Cost Explorer data  
2. Rotate Groq API key if it was ever pasted in chat  
3. Change Grafana admin password  
4. Enable GitHub `production` environment approvals  
5. Apply **prod** when ready; keep promote-only deploys  
6. Before large user growth: RDS, Redis, ALB request-based autoscaling, CloudFront  
7. Deepen frontend polish on Notes/Quiz pages to match Home  

---

## 12. Document map

| File | Contents |
|------|----------|
| `infra/README.md` | Terraform layout & deploy steps |
| `.github/CI-CD.md` | Pipeline & secrets |
| `infra/MONITORING.md` | Prometheus/Grafana build notes |
| **This document** | End-to-end project story |

---

## 13. Summary

We took an existing AI study app and turned it into a **cloud-ready product platform**: Terraform-managed ECS on AWS, multi-environment promotion, working CI/CD, cost alerts, staging observability with Grafana, and a distinctive 3D frontend. Production remains intentionally gated so nothing ships to customers without staging validation and human confirmation.
