module "app_events_registry_dynamodb_table" {
  source = "terraform-aws-modules/dynamodb-table/aws"

  name     = "app-events-registry"
  hash_key = "pk"

  attributes = [
    {
      name = "pk"
      type = "S"
    }
  ]

  ttl_attribute_name = "ttl"
  ttl_enabled        = true

  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  
  autoscaling_enabled = true
  autoscaling_read = {
    scale_in_cooldown  = 60
    scale_out_cooldown = 45
    target_value       = 75
    max_capacity       = 100
  }
  autoscaling_write = {
    scale_in_cooldown  = 60
    scale_out_cooldown = 40
    target_value       = 75
    max_capacity       = 100
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = var.default_tags
}
