output "alb_url" {
  value = "http://${module.alb.alb_dns_name}"
}

output "ecr_server_url" {
  value = module.ecr.server_repository_url
}

output "ecr_client_url" {
  value = module.ecr.client_repository_url
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "ecs_server_service" {
  value = module.ecs.server_service_name
}

output "ecs_client_service" {
  value = module.ecs.client_service_name
}

output "region" {
  value = var.aws_region
}
