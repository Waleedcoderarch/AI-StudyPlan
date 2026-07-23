resource "aws_cloudwatch_log_group" "server" {
  name              = "/ecs/${var.name_prefix}/server"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_cloudwatch_log_group" "client" {
  name              = "/ecs/${var.name_prefix}/client"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_security_group" "ecs" {
  name_prefix = "${var.name_prefix}-ecs-"
  description = "ECS tasks security group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "From ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.name_prefix}-ecs-sg" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role" "ecs_execution" {
  name = "${var.name_prefix}-ecs-execution"

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

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name = "${var.name_prefix}-ecs-secrets"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [var.groq_secret_arn]
    }]
  })
}

resource "aws_iam_role" "ecs_task" {
  name = "${var.name_prefix}-ecs-task"

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

resource "aws_ecs_cluster" "this" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  tags = var.tags
}

resource "aws_ecs_task_definition" "server" {
  family                   = "${var.name_prefix}-server"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.server_cpu
  memory                   = var.server_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "server"
    image     = var.server_image
    essential = true
    portMappings = [{
      containerPort = 5000
      protocol      = "tcp"
    }]
    environment = [
      { name = "PORT", value = "5000" },
      { name = "NODE_ENV", value = var.environment },
      { name = "SQLITE_FILE", value = "/data/database.sqlite" },
      { name = "CORS_ORIGIN", value = var.cors_origin },
      { name = "OPENAI_BASE_URL", value = "https://api.groq.com/openai/v1" },
      { name = "OPENAI_MODEL", value = var.groq_model }
    ]
    secrets = [{
      name      = "OPENAI_API_KEY"
      valueFrom = var.groq_secret_arn
    }]
    mountPoints = [{
      sourceVolume  = "sqlite-data"
      containerPath = "/data"
      readOnly      = false
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.server.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "server"
      }
    }
  }])

  volume {
    name = "sqlite-data"
    efs_volume_configuration {
      file_system_id     = var.efs_file_system_id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = var.efs_access_point_id
        iam             = "DISABLED"
      }
    }
  }

  tags = var.tags
}

resource "aws_ecs_task_definition" "client" {
  family                   = "${var.name_prefix}-client"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.client_cpu
  memory                   = var.client_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "client"
    image     = var.client_image
    essential = true
    portMappings = [{
      containerPort = 80
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.client.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "client"
      }
    }
  }])

  tags = var.tags
}

resource "aws_ecs_service" "server" {
  name            = "${var.name_prefix}-server"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.server.arn
  desired_count   = var.server_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = var.assign_public_ip
  }

  load_balancer {
    target_group_arn = var.server_target_group_arn
    container_name   = "server"
    container_port   = 5000
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  depends_on = [aws_iam_role_policy_attachment.ecs_execution]

  tags = var.tags

  lifecycle {
    ignore_changes = [desired_count]
  }
}

resource "aws_ecs_service" "client" {
  name            = "${var.name_prefix}-client"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.client.arn
  desired_count   = var.client_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = var.assign_public_ip
  }

  load_balancer {
    target_group_arn = var.client_target_group_arn
    container_name   = "client"
    container_port   = 80
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  tags = var.tags

  lifecycle {
    ignore_changes = [desired_count]
  }
}

resource "aws_appautoscaling_target" "server" {
  max_capacity       = var.server_max_count
  min_capacity       = var.server_min_count
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.server.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "server_cpu" {
  name               = "${var.name_prefix}-server-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.server.resource_id
  scalable_dimension = aws_appautoscaling_target.server.scalable_dimension
  service_namespace  = aws_appautoscaling_target.server.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 60
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}
