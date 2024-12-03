# module "static-assets_cloud-storage-static-website" {
#   # required
#   source              = "gruntwork-io/static-assets/google//modules/cloud-storage-static-website"
#   version             = "0.6.0"
#   project             = local.project_id
#   website_domain_name = "www.${local.domain_name}"

#   # optional
#   create_dns_entry      = true
#   dns_managed_zone_name = module.cloud-dns.name

#   force_destroy_website            = true
#   force_destroy_access_logs_bucket = true
#   enable_versioning                = true
#   website_location                 = "ASIA-SOUTHEAST2"
#   website_storage_class            = "STANDARD"
# }
