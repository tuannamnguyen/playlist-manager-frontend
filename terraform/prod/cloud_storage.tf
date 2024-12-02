resource "google_storage_bucket_object" "indexpage" {
  bucket       = module.static-assets_cloud-storage-static-website.website_bucket_name
  name         = "index.html"
  content_type = "text/html"
  source       = "${path.root}/../../dist/index.html"
}
