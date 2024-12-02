module "cloud-dns" {
  source  = "terraform-google-modules/cloud-dns/google"
  version = "5.3.0"
  # insert the 3 required variables here

  domain     = "${local.domain_name}."
  name       = "tunebridge"
  project_id = local.project_id

  type = "public"
}
