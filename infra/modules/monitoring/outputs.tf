output "grafana_url" {
  value = "${var.alb_url}/grafana/"
}

output "monitoring_service_name" {
  value = aws_ecs_service.monitoring.name
}
