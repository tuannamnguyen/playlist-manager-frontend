terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.4.0"
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
  project_id = "playlist-manager-437214"
  region     = "asia-southeast1"
}
