module "app_events_registry_stream_lambda" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "app-events-registry-stream"
  handler       = "index.lambda_handler"
  runtime       = "nodejs14.x"

  source_path = "./lambda_src/app-events-registry-stream"

  event_source_mapping = {
    dynamodb = {
      event_source_arn  = module.app_events_registry_dynamodb_table.dynamodb_table_stream_arn
      starting_position = "LATEST"
      #   destination_arn_on_failure = aws_sqs_queue.failure.arn
      #   filter_criteria = {
      #     pattern = jsonencode({
      #       eventName : ["INSERT"]
      #     })
      #   }
    }
  }

  allowed_triggers = {
    dynamodb = {
      principal  = "dynamodb.amazonaws.com"
      source_arn = module.app_events_registry_dynamodb_table.dynamodb_table_stream_arn
    }
  }

  create_current_version_allowed_triggers = false
  attach_policy_json                      = true
  policy_json                             = data.aws_iam_policy_document.app_events_registry_stream_lambda_policy.json

  tags = var.default_tags
}

data "aws_iam_policy_document" "app_events_registry_stream_lambda_policy" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:DescribeStream",
      "dynamodb:GetRecords",
      "dynamodb:GetShardIterator",
      "dynamodb:ListStreams"
    ]

    resources = [
      module.app_events_registry_dynamodb_table.dynamodb_table_stream_arn
    ]
  }
}







module "app_events_check_lambda" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "app-events-check"
  handler       = "index.lambda_handler"
  runtime       = "nodejs14.x"

  source_path = "./lambda_src/app-events-check"

  event_source_mapping = {
    sqs = {
      event_source_arn = module.app_events_sqs.sqs_queue_arn
      # https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
      function_response_types = ["ReportBatchItemFailures"]
    }
  }

  allowed_triggers = {
    sqs = {
      principal  = "sqs.amazonaws.com"
      source_arn = module.app_events_sqs.sqs_queue_arn
    }
  }

  create_current_version_allowed_triggers = false
  attach_policy_json                      = true
  policy_json                             = data.aws_iam_policy_document.app_events_check_lambda_policy.json

  tags = var.default_tags
}

data "aws_iam_policy_document" "app_events_check_lambda_policy" {
  statement {
    effect = "Allow"

    actions = [
      "sqs:GetQueueAttributes",
      "sqs:DeleteMessage",
      "sqs:ReceiveMessage"
    ]

    resources = [
      module.app_events_sqs.sqs_queue_arn
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem"
    ]

    resources = [
      module.app_events_registry_dynamodb_table.dynamodb_table_arn
    ]
  }
}
