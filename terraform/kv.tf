resource "cloudflare_workers_kv_namespace" "ongoing_games" {
  account_id = var.cloudflare_account_id
  title      = "snooker_ongoing"
}
