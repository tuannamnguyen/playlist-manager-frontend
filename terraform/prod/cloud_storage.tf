resource "google_storage_bucket" "static_assets" {
  name     = local.domain_name
  location = "ASIA-SOUTHEAST2"

  uniform_bucket_level_access = true
  force_destroy               = true

  website {
    main_page_suffix = "index.html"
  }
}

locals {
  dist_directory = "${path.root}/../../dist/"

  mime_types = {
    htm  = "text/html"
    html = "text/html"
    css  = "text/css"
    ttf  = "font/ttf"
    js   = "application/javascript"
    map  = "application/javascript"
    json = "application/json"
    jpg  = "image/jpeg"
    ico  = "image/x-icon"
    png  = "image/png"
  }
}

data "local_file" "files" {
  for_each = fileset(local.dist_directory, "**")
  filename = "${local.dist_directory}${each.key}"
}

resource "google_storage_bucket_object" "static_files" {
  for_each = data.local_file.files

  bucket = google_storage_bucket.static_assets.name
  name   = each.key
  source = each.value.filename
  content_type = lookup(
    local.mime_types,
    regex("[^.]+$", each.key),
    "application/octet-stream"
  )
}

resource "google_storage_bucket_iam_member" "public_rule" {
  bucket = google_storage_bucket.static_assets.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
