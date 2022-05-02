module "app_events_sqs" {
  source = "terraform-aws-modules/sqs/aws"

  name = "app-events"

  redrive_policy = jsonencode({
    deadLetterTargetArn = module.app_events_dlq_sqs.sqs_queue_arn
    maxReceiveCount     = 5
  })

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [module.app_events_dlq_sqs.sqs_queue_arn]
  })

  tags = var.default_tags
}

module "app_events_dlq_sqs" {
  source = "terraform-aws-modules/sqs/aws"

  name = "app-events-dlq"

  tags = var.default_tags
}
