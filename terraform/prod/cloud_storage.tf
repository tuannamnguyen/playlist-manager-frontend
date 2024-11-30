resource "google_storage_bucket" "fe_prod_bucket" {
  name          = "tunebridge-static-bucket"
  location      = "ASIA-SOUTHEAST1"
  storage_class = "STANDARD"

  force_destroy               = true
  uniform_bucket_level_access = true
}
