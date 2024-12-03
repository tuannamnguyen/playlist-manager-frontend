module "cloud-dns" {
  source  = "terraform-google-modules/cloud-dns/google"
  version = "5.3.0"
  # insert the 3 required variables here

  domain     = "${local.domain_name}."
  name       = "tunebridge"
  project_id = local.project_id

  type = "public"

  recordsets = [
    {
      name = "www"
      type = "CNAME"
      ttl  = 300
      records = [
        "${local.domain_name}."
      ]
    }
  ]
}

resource "porkbun_nameservers" "nameservers" {
  domain      = local.domain_name
  nameservers = [for ns in module.cloud-dns.name_servers : replace(ns, "/\\.$/", "")]
}
