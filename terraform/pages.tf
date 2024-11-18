resource "cloudflare_pages_project" "snooker" {
  account_id        = var.cloudflare_account_id
  name              = "snooker-tracker"
  production_branch = "main"

  source {
    type = "github"
    config {
      owner                         = "m0ar"
      repo_name                     = "snooker-tracker"
      production_branch             = "main"
      pr_comments_enabled           = true
      deployments_enabled           = true
      production_deployment_enabled = true
      preview_deployment_setting    = "custom"
      preview_branch_includes       = ["*"]
      preview_branch_excludes       = ["main"]
    }
  }

  build_config {
    build_command       = "npm run build"
    destination_dir     = ".svelte-kit/cloudflare"
    root_dir            = null
  }

  deployment_configs {
    preview {
      compatibility_date = "2024-11-18"
      fail_open         = true
      usage_model       = "standard"
    }
    production {
      compatibility_date = "2024-11-18"
      fail_open         = true
      usage_model       = "standard"
    }
  }
}

resource "cloudflare_pages_domain" "snooker" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.snooker.name
  domain       = cloudflare_record.snooker.hostname
}
