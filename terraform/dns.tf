data "cloudflare_zone" "hubinette_me" {
  name = "hubinette.me"
}

resource "cloudflare_record" "snooker" {
  zone_id = data.cloudflare_zone.hubinette_me.id
  type    = "CNAME"
  name    = "snooker"
  content = "snooker-tracker.pages.dev"
  proxied = true
}
