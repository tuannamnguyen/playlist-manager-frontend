# Reserve IP address
resource "google_compute_global_address" "default" {
  name = "tunebridge-ip"
}

resource "google_compute_managed_ssl_certificate" "lb_default" {
  provider = google-beta
  name     = "tunebridge-ssl-cert"

  managed {
    domains = [local.domain_name]
  }
}

resource "google_compute_url_map" "default" {
  name            = "https-lb"
  default_service = google_compute_backend_bucket.static_assets.id
}

resource "google_compute_target_https_proxy" "lb_default" {
  provider = google-beta
  name     = "tunebridge-https-proxy"
  url_map  = google_compute_url_map.default.id

  ssl_certificates = [google_compute_managed_ssl_certificate.lb_default.name]
}

resource "google_compute_global_forwarding_rule" "default" {
  name                  = "https-lb-forwarding-rule"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "443"
  target                = google_compute_target_https_proxy.lb_default.id
  ip_address            = google_compute_global_address.default.id
}
