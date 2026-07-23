terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

module "vpc" {
  source             = "../../modules/vpc"
  name_prefix        = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  enable_nat_gateway = var.enable_nat_gateway
  tags               = local.tags
}

module "ecr" {
  source      = "../../modules/ecr"
  name_prefix = local.name_prefix
  tags        = local.tags
}

module "alb" {
  source            = "../../modules/alb"
  name_prefix       = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  tags              = local.tags
}

resource "aws_secretsmanager_secret" "groq" {
  name                    = "${local.name_prefix}-groq-api-key"
  recovery_window_in_days = 7
  tags                    = local.tags
}

resource "aws_secretsmanager_secret_version" "groq" {
  secret_id     = aws_secretsmanager_secret.groq.id
  secret_string = var.groq_api_key
}

module "efs" {
  source      = "../../modules/efs"
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = var.vpc_cidr
  subnet_ids  = var.enable_nat_gateway ? module.vpc.private_subnet_ids : module.vpc.public_subnet_ids
  tags        = local.tags
}

module "ecs" {
  source                    = "../../modules/ecs"
  name_prefix               = local.name_prefix
  environment               = var.environment
  aws_region                = var.aws_region
  vpc_id                    = module.vpc.vpc_id
  subnet_ids                = var.enable_nat_gateway ? module.vpc.private_subnet_ids : module.vpc.public_subnet_ids
  assign_public_ip          = !var.enable_nat_gateway
  alb_security_group_id     = module.alb.alb_security_group_id
  server_target_group_arn   = module.alb.server_target_group_arn
  client_target_group_arn   = module.alb.client_target_group_arn
  server_image              = "${module.ecr.server_repository_url}:${var.image_tag}"
  client_image              = "${module.ecr.client_repository_url}:${var.image_tag}"
  groq_secret_arn           = aws_secretsmanager_secret.groq.arn
  groq_model                = var.groq_model
  cors_origin               = "http://${module.alb.alb_dns_name}"
  efs_file_system_id        = module.efs.file_system_id
  efs_access_point_id       = module.efs.access_point_id
  server_cpu                = var.server_cpu
  server_memory             = var.server_memory
  client_cpu                = var.client_cpu
  client_memory             = var.client_memory
  server_desired_count      = var.server_desired_count
  client_desired_count      = var.client_desired_count
  server_min_count          = var.server_min_count
  server_max_count          = var.server_max_count
  log_retention_days        = 14
  enable_container_insights = true
  tags                      = local.tags
}

module "cost_alerts" {
  source                      = "../../modules/cost_alerts"
  name_prefix                 = local.name_prefix
  monthly_budget_usd          = var.monthly_budget_usd
  alert_email                 = var.alert_email
  billing_alarm_threshold_usd = var.billing_alarm_threshold_usd
  tags                        = local.tags
}
