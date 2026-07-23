output "sns_topic_arn" {
  value = aws_sns_topic.cost_alerts.arn
}

output "budget_name" {
  value = aws_budgets_budget.monthly.name
}
