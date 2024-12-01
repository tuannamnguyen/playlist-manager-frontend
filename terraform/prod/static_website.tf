module "static-assets_cloud-storage-static-website" {
  # required
  source              = "gruntwork-io/static-assets/google//modules/cloud-storage-static-website"
  version             = "0.6.0"
  project             = local.project_id
  website_domain_name = local.domain_name
  create_dns_entry    = false

  # optional
  force_destroy_website = true
  force_destroy_access_logs_bucket = true
  enable_versioning = true
  index_page = "${path.root}/../../dist/index.html"
  website_location = "ASIA-SOUTHEAST2"
  website_storage_class = "STANDARD"
}
