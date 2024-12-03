terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.4.0"
    }

    porkbun = {
      source  = "kyswtn/porkbun"
      version = "0.1.2"
    }
  }

  backend "gcs" {
    bucket = "playlist-manager-fe-tf-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = local.project_id
  region  = local.region
}

locals {
  project_id  = "playlist-manager-437214"
  region      = "asia-southeast1"
  domain_name = "tunebridge.sbs"
}


# variable "porkbun_api_key" {
#   type = string
# }

# variable "porkbun_secret_api_key" {
#   type = string
# }

# provider "porkbun" {
#   api_key        = var.porkbun_api_key
#   secret_api_key = var.porkbun_secret_api_key
# }
