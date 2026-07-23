output "alb_arn" {
  value = aws_lb.this.arn
}

output "alb_arn_suffix" {
  value = aws_lb.this.arn_suffix
}

output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "http_listener_arn" {
  value = aws_lb_listener.http.arn
}

output "server_target_group_arn" {
  value = aws_lb_target_group.server.arn
}

output "server_target_group_arn_suffix" {
  value = aws_lb_target_group.server.arn_suffix
}

output "client_target_group_arn" {
  value = aws_lb_target_group.client.arn
}
