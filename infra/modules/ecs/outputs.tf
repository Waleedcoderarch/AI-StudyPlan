output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "cluster_id" {
  value = aws_ecs_cluster.this.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "server_service_name" {
  value = aws_ecs_service.server.name
}

output "client_service_name" {
  value = aws_ecs_service.client.name
}
