locals {
  name_prefix = var.name_prefix
}

resource "aws_cloudwatch_log_group" "monitoring" {
  name              = "/ecs/${local.name_prefix}/monitoring"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_iam_role" "execution" {
  name = "${local.name_prefix}-mon-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  name = "${local.name_prefix}-mon-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "yace_cloudwatch" {
  name = "${local.name_prefix}-yace"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics",
          "tag:GetResources",
          "tag:GetTagValues",
          "tag:GetTagKeys",
          "apigateway:GET",
          "aps:ListWorkspaces",
          "autoscaling:Describe*",
          "ecs:Describe*",
          "ecs:List*",
          "elasticloadbalancing:Describe*",
          "ec2:Describe*"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_lb_target_group" "grafana" {
  name        = "${local.name_prefix}-grafana"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-grafana-tg" })
}

resource "aws_lb_listener_rule" "grafana" {
  listener_arn = var.http_listener_arn
  priority     = 5

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }

  condition {
    path_pattern {
      values = ["/grafana", "/grafana/*"]
    }
  }
}

resource "aws_ecs_task_definition" "monitoring" {
  family                   = "${local.name_prefix}-monitoring"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "yace"
      image     = var.yace_image
      essential = true
      command   = ["--config.file=/config/config.yml"]
      portMappings = [{
        containerPort = 5000
        protocol      = "tcp"
      }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.monitoring.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "yace"
        }
      }
    },
    {
      name      = "prometheus"
      image     = var.prometheus_image
      essential = true
      portMappings = [{
        containerPort = 9090
        protocol      = "tcp"
      }]
      dependsOn = [{
        containerName = "yace"
        condition     = "START"
      }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.monitoring.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "prometheus"
        }
      }
    },
    {
      name      = "alertmanager"
      image     = var.alertmanager_image
      essential = false
      portMappings = [{
        containerPort = 9093
        protocol      = "tcp"
      }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.monitoring.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "alertmanager"
        }
      }
    },
    {
      name      = "grafana"
      image     = var.grafana_image
      essential = true
      environment = [
        { name = "GF_SECURITY_ADMIN_USER", value = var.grafana_admin_user },
        { name = "GF_SECURITY_ADMIN_PASSWORD", value = var.grafana_admin_password },
        { name = "GF_SERVER_ROOT_URL", value = "${var.alb_url}/grafana/" },
        { name = "GF_SERVER_SERVE_FROM_SUB_PATH", value = "true" },
        { name = "GF_USERS_DEFAULT_THEME", value = "dark" },
        { name = "GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH", value = "/var/lib/grafana/dashboards/ai-studyplan-ops.json" }
      ]
      portMappings = [{
        containerPort = 3000
        protocol      = "tcp"
      }]
      dependsOn = [{
        containerName = "prometheus"
        condition     = "START"
      }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.monitoring.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "grafana"
        }
      }
    }
  ])

  tags = var.tags
}

resource "aws_ecs_service" "monitoring" {
  name            = "${local.name_prefix}-monitoring"
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.monitoring.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.grafana.arn
    container_name   = "grafana"
    container_port   = 3000
  }

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  tags = var.tags

  lifecycle {
    ignore_changes = [desired_count]
  }
}

# Scaling / reliability alarms → existing SNS (works without SMTP)
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "${local.name_prefix}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "ECS CPU > 70% — scaling pressure"
  alarm_actions       = [var.sns_topic_arn]
  ok_actions          = [var.sns_topic_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.server_service_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${local.name_prefix}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "ALB target 5xx spike — possible crash/bad gateway"
  alarm_actions       = [var.sns_topic_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "${local.name_prefix}-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "Unhealthy targets — users may see 502"
  alarm_actions       = [var.sns_topic_arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.server_target_group_arn_suffix
  }

  tags = var.tags
}
