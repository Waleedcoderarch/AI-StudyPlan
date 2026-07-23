# Observability (Prometheus + Grafana)

Staging hosts the monitoring stack on ECS Fargate:

- **YACE** — exports CloudWatch ECS/ALB metrics to Prometheus
- **Prometheus** — scrapes + evaluates scaling alert rules
- **Alertmanager** — alert routing (UI)
- **Grafana** — executive dashboard (dark theme)

## Access

After deploy:

`http://<staging-alb>/grafana/`

Default login (change in Terraform vars):
- user: `admin`
- password: from `grafana_admin_password`

## Scaling alerts (email via SNS)

CloudWatch alarms (CPU, ALB 5xx, unhealthy hosts) publish to the staging SNS topic → your email.

Prometheus also evaluates the same classes of alerts for the Grafana/Alertmanager UI.

## Build images

```powershell
$ACCOUNT = "588681235213"
$REGION = "us-east-1"
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

docker build -t "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-prometheus:latest" docker/monitoring/prometheus
docker build -t "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-grafana:latest" docker/monitoring/grafana
docker build -t "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-yace:latest" docker/monitoring/yace
docker build -t "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-alertmanager:latest" docker/monitoring/alertmanager

docker push "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-prometheus:latest"
docker push "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-grafana:latest"
docker push "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-yace:latest"
docker push "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/ai-studyplan-staging-alertmanager:latest"
```
