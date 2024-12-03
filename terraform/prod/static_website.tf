module "static-assets_http-load-balancer-website" {
  source  = "gruntwork-io/static-assets/google//modules/http-load-balancer-website"
  version = "0.6.0"

  # insert the 2 required variables here
  project             = local.project_id
  website_domain_name = "www.${local.domain_name}"

  # optional
  create_dns_entry      = true
  dns_managed_zone_name = module.cloud-dns.name

  force_destroy_website            = true
  force_destroy_access_logs_bucket = true
  enable_versioning                = true
  website_location                 = "ASIA-SOUTHEAST2"
  website_storage_class            = "STANDARD"
  enable_ssl                       = true
  ssl_certificate                  = google_compute_managed_ssl_certificate.lb_default.self_link
}

resource "google_compute_managed_ssl_certificate" "lb_default" {
  provider = google-beta
  name     = "tunebridge-ssl-cert"

  managed {
    domains = [local.domain_name]
  }
}
