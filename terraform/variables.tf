# Override with secrets.tfvars
variable "cloudflare_api_token" {
    type = string
    sensitive = true
}

variable "cloudflare_account_id" {
    type = string
    default = "dbd1a42464c554b98a1b1b43c68e79cc"
}
